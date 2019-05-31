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

## Part I: Kernel Space

This first blog post (and talk) is scoped to Linux kernel related topics, which
will provide you with the necessary foundation to build up a deep understanding
about containers. We will gain an insight about the history of UNIX, Linux and
talk about solutions like chroot, namespaces and cgroups combined with hacking
our own examples. Besides this we will peel some containers to get a feeling
about future topics we will talk about.

You can find the blog post:

- [on GitHub](part1-kernel-space/post.md)
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
- [on Medium]()
- [on SUSE]()

The corresponding talk:

- [on Meetup](http://meetu.ps/e/GPJ3T/tbX1P/f)
- [on YouTube](https://youtu.be/UnnAhjJEdH4)

The slides of the talk:

- [on Slides.com](https://slides.com/saschagrunert/demystifying-containers-part-ii-container-runtimes)

---

## Part X

Further parts of the series are not available yet.

# Contributing

You want to contribute to this project? Wow, thanks! So please just fork it and
send me a pull request.
