# Demystifying containers - Part 1: Kernel Space

## About the series

This series of blog posts and corresponding talks aims to provide you a
pragmatic view on containers from a historic perspective. We will discover all
layers of modern cloud architectures, which means we will start at the Kernel
level and will end up at writing our own secure cloud native applications.

Simple examples paired with the historic background will guide you from the
beginning with a minimal Linux environment up to crafting secure containers
which fit perfectly into today's and future orchestration world. At the end it
should be much easier understand how features in the Linux kernel, container
tools, runtimes, software defined networks and orchestration software like
Kubernetes are designed and how they work under the hood.

This first blog post and talk will be all about Linux kernel related topics
around containers, which will provide you the necessary foundation to build up a
deep understanding about containers. We will gain an insight about the history
of UNIX, Linux and talk about solutions like chroot, namespaces and cgroups
combined with hacking our own examples. Beside this we will peel some containers
to get a feeling about future topics we will talk about.

## Table of Contents

- [Introduction](#introduction)
- [chroot](#chroot)
- [Linux Namespaces](#linux-namespaces)
  - [Namespace API](#namespace-api)
    - [Mount (mnt)](#mount--mnt-)
    - [UNIX Time-sharing System (UTS)](#unix-time-sharing-system--uts-)
    - [Interprocess Communication (IPC)](#interprocess-communication--ipc-)
    - [Process ID (pid)](#process-id--pid-)
    - [Network (net)](#network--net-)
    - [User ID (user)](#user-id--user-)
    - [Control group (cgroup)](#control-group--cgroup-)
  - [API example](#api-example)
  - [Composing namespaces](#composing-namespaces)
- [Putting all together](#putting-all-together)
- [Conclusion](#conclusion)

## Introduction

If we are talking about containers nowadays most people think of the big blue
whale or the white steering wheel on the blue background. But what are
containers in detail? People tend to imagine them as cheap virtual machines
(VMs), which could be reasoned because the word _container_ does not mean
anything precisely.

If we strip it down then containers are only isolated groups of processes
running on a single host, which fulfill a set of _common_ features. Some of
these fancy features are built directly into the Linux kernel and mostly all of
them have different historical origins.

So containers have to fulfill four major requirements to be acceptable:

1. Not negotiable: They have to run on a single host. Okay, so two computers
   cannot create a single container.
2. Clearly: They are groups of processes. You might know that Linux processes
   live inside a tree structure, so we can say containers must have a root
   process.
3. Okay: They need to be isolated, whatever this means in detail.
4. Not so clear: They have to fulfill common features. Features in general seem
   to change over time, so we have to point out what these most common features
   are.

These requirements alone can lead into confusion. So let’s start from the
historical beginning to keep things simple.

## chroot

Mostly every UNIX operating system has the possibility to change the root
directory of the current running process (and its children). You can use chroot
as system call (a Linux kernel API function call) or standalone wrapper program
to achieve this. The first occurrence of this system call (syscall) was
introduced in UNIX Version 7 (released 1979) and continued its journey into the
awesome Berkeley Software Distribution (BSD). Chroot is also referenced as
„jail“, because a guy used it as a honeypot to monitor a security hacker back
in 1991. So chroot is much older than Linux and it has been used in the early
2000s for the first approaches in running applications as what we call today as
microservices. Chroot is currently used as standalone solution by a wide range
of applications, like for build services in different distributions. Nowadays
the BSD implementation differs a lots from the Linux brother and we will for now
focus on the latter.

What is needed to run an own chroot environment? Not pretty much, since
something like this already works:

```
> mkdir -p new-root/{bin,lib64}
> cp /bin/bash new-root/bin
> cp /lib64/{ld-linux-x86-64.so*,libc.so*,libdl.so.2,libreadline.so*,libtinfo.so*} new-root/lib64
> sudo chroot new-root
```

We create a new root directory, copy a shell and its dependencies in and run
`chroot`. This jail is pretty useless: All we have at hand is bash and its
builtin functions like `cd` and `pwd`.

The current working directory is left unchanged when calling chroot whereas
relative paths can still refer to files outside of the new root. Beside this,
further calls to chroot do not stack and they will be overwritten.

Someone might think it could be worth running a statically linked binary in a
jail and that is the same as running a container image. It’s absolutely not, and
a jail is not really a standalone security feature but more something like a
good addition to a safe system.

Only privileged processes with `CAP_SYS_CHROOT` capability are able to call
chroot. This call changes the root path and nothing else. This means it does
also not change the current working directory, so that after the call '.' can be
outside the tree rooted at '/'. At the end of the day the root user can easily
escape from a jail by running a program like this:

```c
#include <sys/stat.h>
#include <unistd.h>

int main(void)
{
    mkdir(".out", 0755);
    chroot(".out");
    chdir("../../../../../");
    chroot(".");
    return execl("/bin/bash", "-i", NULL);
}
```

But to continue with a more usefully jail we need an appropriate root file
system (rootfs). This contains all necessary binaries, libraries and the needed
file structure. But where to get one? What about peeling it from an already
existing Open Container Initiative (OCI) container:

```
> skopeo copy docker://opensuse/tumbleweed:latest oci:tumbleweed:latest
> sudo umoci unpack --image tumbleweed:latest bundle
```

Now with our freshly downloaded and extracted rootfs we can chroot into the jail
via:

```
> sudo chroot bundle/rootfs
> ls -l
```

It looks like we're running inside a fully working environment, right? But what
did we achieve? We can see that we can sneaky peak outside of the jail from
a process perspective:

```
> mkdir /proc
> mount -t proc proc /proc
> ps aux
```

There is no process isolation available at all. We can even kill programs
running outside of the jail, what a metaphor! Let’s peek into the network
devices:

```
> mkdir /sys
> mount -t sysfs sys /sys
> ls /sys/class/net
```

There is no network isolation, too. This leads into a lots of security related
concerns, because jails are sometimes used for wrong (security related)
purposes. How to solve this? This is where the Linux namespaces join the party.

## Linux Namespaces

Namespaces are a Linux kernel feature which were introduced back in 2002 with
Linux 2.4.19. The idea behind a namespace is to wrap certain global system
resources in an abstraction layer. This makes it appear that the processes
within a namespace have their own isolated instance of the resource. The kernels
namespace abstraction allows different groups of processes to have different
views of the system.

Not all available namespaces were implemented from the beginning on. A full
support for what we now understand as containers was finished in kernel version
3.8 back in 2013 with the introduction of the _user_ namespace. We end up having
currently seven distinct namespaces implemented: mnt, pid, net, ipc, uts, user
and cgroup. No worries, we discuss them in detail. In September 2016 two
additional namespaces were proposed: time and syslog, which are not fully
implemented yet. Let’s have a look into the available namespaces in detail.

### Namespace API

The namespace API of the Linux kernel consists of three main system calls:

- `clone()` - Creates a child process, in a manner similar to `fork()`. This
  allows the child process to share parts of its execution context with the
  calling process, such as the memory space, the table of file descriptors, and
  the table of signal handlers.

- `unshare()` - Allows a process to disassociate parts of the execution context
  which currently being shared with others. Some parts of the execution context,
  such as the mount namespace, is shared implicitly when using `fork()`.

- `setns()` - Given a file descriptor referring to a namespace, reassociate the
  calling thread with that one. This function can be used to join to an existing
  namespace. It also helps to keep a namespace open even if it contains no
  actual process.

Beside the available syscalls, the `proc` filesystem populates additional
namespace related files. Since Linux 3.8, each file in `/proc/$PID/ns` is a
symbolic link which can be used as a handle for performing operations to the
referenced namespace, like `setns()`.

```
> ls -Gg /proc/self/ns/
total 0
lrwxrwxrwx 1 0 Feb  6 18:32 cgroup -> 'cgroup:[4026531835]'
lrwxrwxrwx 1 0 Feb  6 18:32 ipc -> 'ipc:[4026531839]'
lrwxrwxrwx 1 0 Feb  6 18:32 mnt -> 'mnt:[4026531840]'
lrwxrwxrwx 1 0 Feb  6 18:32 net -> 'net:[4026532008]'
lrwxrwxrwx 1 0 Feb  6 18:32 pid -> 'pid:[4026531836]'
lrwxrwxrwx 1 0 Feb  6 18:32 pid_for_children -> 'pid:[4026531836]'
lrwxrwxrwx 1 0 Feb  6 18:32 user -> 'user:[4026531837]'
lrwxrwxrwx 1 0 Feb  6 18:32 uts -> 'uts:[4026531838]'
```

This allows us for example to track in which namespaces certain processes
reside. Another way to play around with namespaces beside the programmatic
approach is using tools from the `util-linux` package. This contains dedicated
wrapper programs for the mentioned syscalls. One handy tool related to
namespaces within this package is `lsns`. It lists useful information about all
currently accessible namespaces or about a single given one. But now let’s
finally get our hands dirty.

#### Mount (mnt)

The first namespace we want to try out is the mnt namespace, which was the first
implemented one back in 2002. During that time (mostly) nobody thought that
multiple namespaces ever were needed, so they decided to call the namespace
clone flag `CLONE_NEWNS`. This leads into a small inconsistency with other
namespace clone flags (I see you suffering!). With the mnt namespace Linux is
able to isolate a set of mount points by a group of processes.

A great use case of the mnt namespace is to create environments similar to
jails, but in a more secure fashion. How to create such a namespace? This can
easily done via a syscall or the unshare command line tool.

```
> sudo unshare -m
# mkdir mount-dir
# mount -n -o size=10m -t tmpfs tmpfs mount-dir
# df mount-dir
Filesystem     1K-blocks  Used Available Use% Mounted on
tmpfs              10240     0     10240   0% <PATH>/mount-dir
# touch mount-dir/{0,1,2}
```

Looks like we have a successfully mounted tmpfs, which is not available on the
host system level:

```
> ls mount-dir
> grep mount-dir /proc/mounts
>
```

The actual memory being used for the mount point is laying in an abstraction
layer called Virtual File System (VFS), which is part of the kernel and where
every other filesystem is based on. If the namespace gets destroyed, the mount
memory is unrecoverable lost. The mount namespace abstraction gives us the
possibility to create entire virtual environments in which we are the root user
even without root permissions.

On the host system we are able to see the mount point via the `mountinfo` file
inside of the `proc` filesystem:

```
> grep mount-dir /proc/$(pgrep -u root bash)/mountinfo
349 399 0:84 / /mount-dir rw,relatime - tmpfs tmpfs rw,size=1024k
```

How to work with these mount points on a source code level? Well, programs tend
to keep a file handle on the corresponding `/proc/$PID/ns/mnt` file, which
refers to the used namespace. In the end mount namespace related implementation
scenarios can be really complex, but they give us the power to create flexible
container filesystem trees. The last thing I want to mention is that mounts can
have different flavors (shared, slave, private, unbindable), which is greatly
explained within the shared subtree
[documentation](https://www.kernel.org/doc/Documentation/filesystems/sharedsubtree.txt).

#### UNIX Time-sharing System (UTS)

The UTS namespace was introduced in Linux 2.6.19 (2006) and allows us to unshare
the domain- and hostname from the current system. Let's give it a try:

```
> sudo unshare -m
# hostname
nb-sascha
# hostname new-hostname
# hostname
new-hostname
```

And if we look at the system level nothing has changed, hooray:

```
> hostname
nb-sascha
```

The UTS namespace is yet another nice addition in containerization.

#### Interprocess Communication (IPC)

IPC namespaces comes with Linux 2.6.19 (2006) too and isolates interprocess
communication (IPC) resources. In special these are System V IPC objects and
POSIX message queues. One use case of this namespace would be to separate the
shared memory (SHM) between two processes to avoid misusage. Instead each
process will be able to use the same identifiers for a shared memory region and
produce two distinct regions. When an IPC namespace is destroyed, then all IPC
objects in the namespace are automatically destroyed too.

#### Process ID (pid)

The PID namespace was introduced in Linux 2.6.24 (2008) and gives processes an
independent set of process identifiers (PIDs). This means that processes which
reside in different namespaces can own the same PID. In the end a process has
two PIDs: the PID inside the namespace, and the PID outside the namespace on the
host system. The PID namespaces can be nested, so if a new process is created it
will have a PID for each namespace from its current namespace up to the initial
PID namespace.

<!-- Image to explain here -->

The first process created in a PID namespace gets the number 1 and gains all
the same special treatment as the usual init process. For example, all processes
within the namespace are attached to the root PID. This also means that the
termination of this process will immediately terminate all processes in its PID
namespace and any descendants. Let's create a new PID namespace:

```
> sudo unshare -fp --mount-proc
# ps aux
```

Looks isolated, doesn't it? The `--mount-proc` flag is needed to mount the proc
filesystem from the new namespace. Otherwise we would not see the PID subtree
corresponding to the namespace. Another option would be to manually mount the
proc filesystem via `mount -t proc proc /proc`, but this also overrides the
mount from the host.

#### Network (net)

Network namespaces were completed in Linux 2.6.29 (2009) and can be used to
virtualize the network stack. Each network namespace contains its own resource
properties within `/proc/net`. Furthermore, a network namespace contains only a
loopback interface on initial creation:

```
> sudo unshare -n
# ip link
```

Every network interface (physical or virtual) is present in exactly one
namespace. It is possible that the interface will be moved between namespaces.
Each namespace contains a private set of IP addresses, its own routing table,
socket listing, connection tracking table, firewall, and other network-related
resources.

Destroying a network namespace destroys any virtual interfaces within it and
moves any physical interfaces within it back to the initial network namespace.

A possible use case for the network namespace is creating Software Defined
Networks (SDN) via virtual Ethernet (veth) interface pairs. One end of the
network pair will be plugged into a bridged interface whereas the other end
will be assigned to the target container. This is how pod networks like flannel
work in general.

Let's see how it works. First, we need to create a new network namespace:

```
> sudo ip netns add mynet
> sudo ip netns list
```

So we created a new network namespace called `mynet`. When `ip` creates a
network namespace, it will create a bind mount for it under `/var/run/netns`
too. This allows the namespace to persist even when no processes are running
within it.

With `ip netns exec` we can further inspect and manipulate our network
namespace:

```
> sudo ip netns exec mynet ip link list
1: lo: <LOOPBACK> mtu 65536 qdisc noop state DOWN mode DEFAULT group default qlen 1000
    link/loopback 00:00:00:00:00:00 brd 00:00:00:00:00:00
> sudo ip netns exec mynet ping 127.0.0.1
connect: Network is unreachable
```

The network seems down, lets bring it up:

```
> sudo ip netns exec mynet ip link set dev lo up
> sudo ip netns exec mynet ping 127.0.0.1
PING 127.0.0.1 (127.0.0.1) 56(84) bytes of data.
64 bytes from 127.0.0.1: icmp_seq=1 ttl=64 time=0.016 ms
```

Hooray! Now let's create a veth pair which should allow communication later on:

```
> sudo ip link add veth0 type veth peer name veth1
> sudo ip link show type veth
11: veth1@veth0: <BROADCAST,MULTICAST,M-DOWN> mtu 1500 qdisc noop state DOWN mode DEFAULT group default qlen 1000
    link/ether b2:d1:fc:31:9c:d3 brd ff:ff:ff:ff:ff:ff
12: veth0@veth1: <BROADCAST,MULTICAST,M-DOWN> mtu 1500 qdisc noop state DOWN mode DEFAULT group default qlen 1000
    link/ether ca:0f:37:18:76:52 brd ff:ff:ff:ff:ff:ff
```

Both interfaces are automatically connected, which means that packets sent to
veth0 will be received by veth1 and vice versa. Now we associate one end of the
veth pair to our network namespace:

```
> sudo ip link set veth1 netns mynet
> ip link show type veth
12: veth0@if11: <BROADCAST,MULTICAST> mtu 1500 qdisc noop state DOWN mode DEFAULT group default qlen 1000
    link/ether ca:0f:37:18:76:52 brd ff:ff:ff:ff:ff:ff link-netns mynet
```

Our network interfaces need some addresses for sure:

```
> sudo ip netns exec mynet ip addr add 172.2.0.1/24 dev veth1
> sudo ip netns exec mynet ip link set dev veth1 up
> sudo ip addr add 172.2.0.2/24 dev veth0
> sudo ip link set dev veth0 up
```

Communicating in both directions should now be possible:

```
> ping -c1 172.2.0.1
> sudo ip netns exec mynet ping -c1 172.2.0.2
```

It works, but we wouldn't have any internet access from the network namespace.
We would need a network bridge for that and a default route from the namespace.
I leave this task up to you, for now let’s go on to the next namespace.

#### User ID (user)

With Linux 3.5 (2012) the isolation of user and group IDs was finally possible
via namespaces. Linux 3.8 (2013) made it possible to create user namespaces
without being privileged. The user namespace enables that a user and group IDs
of a process can be different inside and outside of the namespace. An
interesting use-case is that a process can have a normal unprivileged user ID
outside a user namespace while being fully privileged inside.

Let's give it a try:

```
> id -u
1000
> unshare -U
> whoami
nobody
```

After the namespace creation, the files `/proc/$PID/{u,g}id_map` expose the
mappings for user and group IDs for the PID. These files can be written only
once to define the mappings. In general each line within these files contain a
one to one mapping of a range of contiguous user IDs between two user
namespaces:

```
> cat /proc/self/uid_map
         0          0 4294967295
```

The example above translates to: With the starting user ID 0 the namespace maps
to a range starting at ID 0, too. For the most parent user namespace this should
be true, and applied to all `2^32 - 1` available IDs.

If now a process tries to access a file, its user and group IDs are mapped into
the initial user namespace for the purpose of permission checking. When a
process retrieves file user and group IDs (via `stat()`), the IDs are mapped in
the opposite direction.

In the unshare example above we call `getuid()` before writing a appropriate
user mapping, which will result in an unmapped ID. This unmapped ID is
automatically converted to the overflow user ID (65534 or the value in
`/proc/sys/kernel/overflow{g,u}id`).

In the end the user namespace enables great security additions to the container
world.

#### Control group (cgroup)

Croups started their journey 2008 with Linux 2.6.24 as dedicated Linux kernel
feature. The main goal of cgroups is to support resource limiting,
prioritization, accounting and controlling. A major redesign started in 2013,
whereas the cgroup namespace was added with Linux 4.6 (2016) to prevent leaking
host information from a namespace. The second version of cgroups were released
too and major features were added since then. One example is an out of memory
(OOM) killer which adds an ability to kill a cgroup as a single unit to
guarantee the integrity of the workload.

Let’s play around with them and create a new cgroup. By default the kernel
exposes cgroups in `/sys/fs/cgroup`. To create a new cgroup, we simple create a
new sub-directoy in that location:

```
> sudo mkdir /sys/fs/cgroup/memory/demo
> ls /sys/fs/cgroup/memory/demo
```

Now we are able to set the memory limits for that cgroup. We are also turning
off swap to make our example implementation work.

```
> sudo su
# echo 100000000 > /sys/fs/cgroup/memory/demo/memory.limit_in_bytes
# echo 0 > /sys/fs/cgroup/memory/demo/memory.swappiness
```

To assign a process to a cgroup we can write the corresponding PID to the
`tasks` file:

```
# echo $$ > /sys/fs/cgroup/memory/demo/tasks
```

Now we can write a sample application to consume the limited 100MB of memory:

```rust
pub fn main() {
    let mut vec = vec![];
    loop {
        vec.extend_from_slice(&[1u8; 10_000_000]);
        println!("{}0 MB", vec.len() / 10_000_000);
    }
}
```

If we run the program, we see that the PID will be killed because of the set
memory constraints and our host system is still usable.

```
# ./memory
Killed
```

### API example

### Composing namespaces

Namespaces are composable, too! This makes it possible to have isolated pid
namespaces in Kubernetes Pods which share the same network interface.

To demonstrate this, let’s create a new namespace with an isolated PID:

```
> sudo unshare -fp --mount-proc
# ps aux
```

The `setns()` syscall with its appropriate wrapper program `nsenter` can now be
used to join the namespace. For this we have to find out which namespace we want
to join:

```
> export PID=$(pgrep -u root bash)
> sudo ls -l /proc/$PID/ns
```

Now it is easily possible to join the namespace via `nsenter`:

```
> sudo nsenter --pid=/proc/$PID/ns/pid unshare --mount-proc
# ps aux
root         1  0.1  0.0  10804  8840 pts/1    S+   14:25   0:00 -bash
root        48  3.9  0.0  10804  8796 pts/3    S    14:26   0:00 -bash
root        88  0.0  0.0   7700  3760 pts/3    R+   14:26   0:00 ps aux
```

We can now see that we are member of the same PID namespace! It is also possible
to enter already running containers via `nsenter`, but this topic will be
covered later on.

## Putting all together

Do you remember the rootfs we extracted from the image within the chroot
section? We can use a low level container runtime like
[`runc`](https://github.com/opencontainers/runc) to easily run a container from
the rootfs:

```
> sudo runc run -b bundle container
# ps aux
```

If we now inspect the system namespaces, we see that `runc` already created
mnt, uts, ipc, pid and net for us:

```
> sudo lsns | grep bash
4026532499 mnt         1  6409 root   /bin/bash
4026532500 uts         1  6409 root   /bin/bash
4026532504 ipc         1  6409 root   /bin/bash
4026532505 pid         1  6409 root   /bin/bash
4026532511 net         1  6409 root   /bin/bash
```

I will stop here and we will learn more about container runtimes in upcoming
blog posts and talks.

## Conclusion

I really hope that the mysteries about containers are now a little bit more
fathomable. If you run Linux it is easy to play around with different isolation
techniques from scratch. In the end a container runtime nicely uses all
these isolation features to provide a stable and robust development or
production platform for containers.

There are a lots of topics which were not covered here because of the level of
detail. A great resource for digging deeper into the topic of Linux namespaces
is the Linux programmers manual: NAMESPACES(7).

The next blog posts will cover container runtimes, security and the overall
ecosystem around latest container technologies.
