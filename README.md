# Demystifying Containers

![logo](logo-fit.png)

This series of blog posts and corresponding talks aims to provide you with a
pragmatic view on containers from a historic perspective. Together we will
discover modern cloud architectures layer by layer, which means we will start at
the Linux Kernel level and end up at writing our own secure cloud native
applications.

Simple examples paired with the historic background will guide you from the
beginning with a minimal Linux environment up to crafting secure containers,
which fit perfectly into todays’ and futures’ orchestration world. In the end it
should be much easier to understand how features within the Linux kernel,
container tools, runtimes, software defined networks and orchestration software
like Kubernetes are designed and how they work under the hood.

## Table of Contents

- [Part I: Kernel Space](#part-i-kernel-space)
- [Part II: Container Runtimes](#part-ii-container-runtimes)
- [Part III: Container Images](#part-iii-container-images)
- [Part IV: Container Security](#part-iv-container-security-)

## Part I: Kernel Space

This first blog post (and talk) is scoped to Linux kernel related topics, which
will provide you with the necessary foundation to build up a deep understanding
about containers. We will gain an insight about the history of UNIX, Linux and
talk about solutions like chroot, namespaces and cgroups combined with hacking
our own examples. Besides this we will peel some containers to get a feeling
about future topics we will talk about.

You can find the blog post:

- [on GitHub](part1-kernel-space/post.md)
- [on CNCF](https://www.cncf.io/blog/2019/06/24/demystifying-containers-part-i-kernel-space)
- [on Medium](https://medium.com/p/2c53d6979504)
- [on SUSE](https://www.suse.com/c/demystifying-containers-part-i-kernel-space)

The corresponding talk:

- [on Meetup](https://meetu.ps/e/GrmTm/CJqk6/f)
- [on YouTube](https://youtu.be/Hb1bsfFyC-Q)

The slides of the talk:

- [on Slides.com](https://slides.com/saschagrunert/demystifying-containers-part-i-kernel-space)

## Part II: Container Runtimes

This second blog post (and talk) is primary scoped to container runtimes, where
we will start with their historic origins before digging deeper into two
dedicated projects: runc and CRI-O. We will initially build up a great
foundation about how container runtimes work under the hood by starting with the
lower level runtime runc. Afterwards, we will utilize the more advanced runtime
CRI-O to run Kubernetes native workloads, but without even running Kubernetes at
all.

You can find the blog post:

- [on GitHub](part2-container-runtimes/post.md)
- [on CNCF](https://www.cncf.io/blog/2019/07/15/demystifying-containers-part-ii-container-runtimes)
- [on Medium](https://medium.com/p/e363aa378f25)
- [on SUSE](https://www.suse.com/c/demystifying-containers-part-ii-container-runtimes)

The corresponding talk:

- [on Meetup](http://meetu.ps/e/GPJ3T/tbX1P/f)
- [on YouTube](https://youtu.be/UnnAhjJEdH4)

The slides of the talk:

- [on Slides.com](https://slides.com/saschagrunert/demystifying-containers-part-ii-container-runtimes)

## Part III: Container Images

This third blog post (and talk) will be all about container images. As usual, we
start with the historic background and the evolution of different container
image formats. Afterwards, we will check out what is inside of the latest Open
Container Initiative (OCI) image specification by crafting, modifying and
pulling apart our self-built container image examples. Besides that, we will learn
some important best practices in modern container image creation by utilizing
tools like buildah, podman and skopeo.

You can find the blog post:

- [on GitHub](part3-container-images/post.md)
- [on Medium](https://medium.com/p/244865de6fef)
- [on SUSE](https://www.suse.com/c/demystifying-containers-part-iii-container-images)

The corresponding talk:

- [on Meetup](https://www.meetup.com/de-DE/Linux-Meetup-Leipzig/events/263578530)
- [on YouTube](https://youtu.be/zjUXCKKJb-E)

The slides of the talk:

- [on Slides.com](https://slides.com/saschagrunert/demystifying-containers-part-iii-container-images)

## Part IV: Container Security

Security-related topics can be overwhelming, especially when we’re talking
about the fast-pacing container ecosystem. After encountering multiple security
vulnerabilities in 2019, the press is now questioning if containers are secure
enough for our applications and if switching from Virtual Machines (VMs) to
container-based workloads is really a good idea. Technologies like micro VMs
target to add an additional layer of security to sensitive applications.

But is security really a problem when speaking about running applications
inside? It indeed is, if we do not fully understand the implications of the
security-related possibilities we can apply or if we don’t use them at all.

In this blog post, we will discover the bright world of container security in a
pragmatic way. We will learn about relatively low level security mechanisms
like Linux [capabilities][40] or [seccomp][41], but also about fully featured
security enhancements like [SELinux][42] and [AppArmor][43]. We’ll have the
chance to build up a common ground of understanding around container security.
Besides that, we will take a look into securing container workloads at a higher
level inside [Kubernetes][44] clusters by using [Pod Security Policies][45] and
by securing the container images itself. To achieve all of this, we will verify
the results of our experiments by utilizing end-user applications like
Kubernetes and [Podman][46].

[40]: http://man7.org/linux/man-pages/man7/capabilities.7.html
[41]: https://en.wikipedia.org/wiki/Seccomp
[42]: https://en.wikipedia.org/wiki/Security-Enhanced_Linux
[43]: https://en.wikipedia.org/wiki/AppArmor
[44]: https://kubernetes.io
[45]: https://kubernetes.io/docs/concepts/policy/pod-security-policy
[46]: https://podman.io

You can find the blog post:

- [on GitHub](part4-container-security/post.md)
- [on SUSE](https://www.suse.com/c/demystifying-containers-part-iv-container-security)

---

## Part X

Further parts of the series are not available yet.

# Contributing

You want to contribute to this project? Wow, thanks! So please just fork it and
send me a pull request.
