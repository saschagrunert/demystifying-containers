FROM opensuse/tumbleweed
RUN zypper in --force-resolution -y \
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
