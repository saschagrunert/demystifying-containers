# Pin to a specific tag for reproducible builds, e.g.:
# FROM opensuse/tumbleweed:20231001
FROM opensuse/tumbleweed
RUN zypper ar -fG https://download.opensuse.org/repositories/isv:/cri-o:/prerelease:/main/rpm/ cri-o && \
    zypper in --force-resolution --allow-vendor-change --replacefiles -y \
    bash-completion \
    cri-o \
    cri-tools \
    curl \
    tmux
COPY 10-crio-bridge.conf /etc/cni/net.d
COPY container.yml /root
COPY sandbox.yml /root
COPY start /usr/bin
WORKDIR /root
ENTRYPOINT ["start"]
