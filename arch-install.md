## 进入系统， 默认以root用户无密码登录了
### Partitioning 
  验证下是否启用了UEFI模式(查看是否存在该目录/sys/firmware/efi/efivars)
  > \# ls /sys/firmware/efi/efivars
####  UEFI (GPT)
>
    # parted /dev/sda -- mklabel gpt
    # parted /dev/sda -- mkpart ESP fat32 1MiB 512MiB
    # parted /dev/sda -- set 1 boot on
    # parted /dev/sda -- mkpart primary 512MiB -2GiB
    # parted /dev/sda -- mkpart primary linux-swap -2GiB 100%
#### Legacy Boot (MBR)
- \# parted /dev/sda -- mklabel msdos
- \# parted /dev/sda -- mkpart primary 1MiB -8GiB
- \# parted /dev/sda -- mkpart primary linux-swap -8GiB 100%
  
### Formatting
####  UEFI (GPT)
- \# mkfs.fat -F 32 -n boot /dev/sda1
- \# mkfs.ext4 -L arch /dev/sda2
- \# mkswap -L swap /dev/sda3
#### Legacy Boot (MBR)
- \# mkfs.ext4 -L arch /dev/sda1
- \# mkswap -L swap /dev/sda2
### Mount the file systems
####  UEFI (GPT)
>
    # mkdir -p /mnt/efi
    # mount /dev/disk/by-label/boot /mnt/boot (mount /dev/sda1 /mnt/boot)
    # mount /dev/disk/by-label/arch /mnt (mount /dev/sda2 /mnt)
    # swapon /dev/sda3 (swapon /dev/disk/by-label/swap)
#### Legacy Boot (MBR)
- \# mount /dev/disk/by-label/arch /mnt (mount /dev/sda1 /mnt)
- \# swapon /dev/sda2 (swapon /dev/disk/by-label/swap)
### Install the base packages
pacstrap /mnt base [base-devel]
### Configure the system
genfstab -U /mnt >> /mnt/etc/fstab
vim /mnt/etc/fstab 检查下 刚才的分区
### Chroot
arch-chroot /mnt [/bin/bash]

### then
>
ln -sf /usr/share/zoneinfo/Asia/Shanghai /etc/localtime
hwclock --systohc
# 配置语言环境
nano /etc/locale.gen
    # 去掉相应语言配置的注释

locale-gen

echo LANG=en_US.UTF-8 > /etc/locale.conf

export LANG=en_US.UTF-8
echo teemo > /etc/hostname

install grub
pacman -S grub-efi-x86_64               #UEFI版本本体
pacman -S efibootmgr                    #EFI管理器
pacman -S os-prober                     #双系统必需管理器(可选)

grub-install --target=x86_64-efi --efi-directory=/efi --bootloader-id=GRUB
grub-mkconfig -o /boot/grub/grub.cfg

### others
exit                                    #退出chroot

umount /mnt/efi                    #取消挂载
umount /mnt
reboot      

已root 登录
useradd -m -G wheel -s /bin/bash freedrb
passwd freedrb
用visudo /etc/sudoers

用新增的账号登录
添加下arch的源
> \#sudo vim /etc/pacman.conf
[archlinuxcn]
#The Chinese Arch Linux communities packages.
SigLevel = Optional TrustAll
Server   = http://repo.archlinuxcn.org/$arch

sudo pacman -Syu yaourt

给刚添加的 用户或者所属组添加sudo权限(visudo)

yaourt 安装ssh

配置 /etc/ssh/sshd_config

Port 端口 默认是22 建议修改这个常用端口

PermitRootLogin no  不允许root用户 通过ssh登录

sudo systemctl enable sshd --now 启用服务 并设置开机自启

先到本机生成一个 公钥
>
    ssh-keygen -t rsa -b 3072 -f id_mailserver
    ssh-copy-id -i  id_rsa.pub user@remoteserver

公用丢服务器上 私钥留在需要登录的机子里
配好之后
到ssh服务器端配置文件里
>
    PasswordAuthentication no 开起来  禁止密码登录
    sudo systemctl restart sshd

