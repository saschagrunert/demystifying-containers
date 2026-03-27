COLOR := \\033[36m
NOCOLOR := \\033[0m
WIDTH := 25

.PHONY: help
help: ## Display this help.
	@awk \
		-v "col=${COLOR}" -v "nocol=${NOCOLOR}" \
		' \
			BEGIN { \
				FS = ":.*##" ; \
				printf "Usage:\n  make %s<target>%s\n", col, nocol \
			} \
			/^[./a-zA-Z_-]+:.*?##/ { \
				printf "  %s%-${WIDTH}s%s %s\n", col, $$1, nocol, $$2 \
			} \
			/^##@/ { \
				printf "\n%s\n", substr($$0, 5) \
			} \
		' $(MAKEFILE_LIST)

##@ Build targets:

.PHONY: all
all: build/c build/rust build/docker ## Build everything.

.PHONY: build/c
build/c: ## Build the C examples.
	gcc -Wall -Wextra -o part1-kernel-space/src/namespaces part1-kernel-space/src/namespaces.c
	gcc -Wall -Wextra -o part1-kernel-space/src/unroot part1-kernel-space/src/unroot.c

.PHONY: build/rust
build/rust: ## Build the Rust memory example.
	cargo build --manifest-path part1-kernel-space/src/Cargo.toml

.PHONY: build/docker
build/docker: ## Build all container images.
	docker build -f part2-container-runtimes/src/Dockerfile part2-container-runtimes/src
	docker build -f part3-container-images/src/Dockerfile part3-container-images/src
	docker build -f part3-container-images/src/Dockerfile-debian part3-container-images/src

##@ Utility targets:

.PHONY: clean
clean: ## Cleanup build artifacts.
	rm -f part1-kernel-space/src/namespaces part1-kernel-space/src/unroot
	cargo clean --manifest-path part1-kernel-space/src/Cargo.toml
