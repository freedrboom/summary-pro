## install  gitolite(server)
安装 gitolite [archwiki](https://wiki.archlinux.org/index.php/Gitolite), 成功之后它会创建一个gitolite的账户和组，gitolite的家目录在/var/lib/gitolite
>\# yaourt gitolite

准备一个公钥 如：freedrb_general.pub,并且用管理员的权限复制公钥到/var/lib/gitolite/freedrb_general.pub， freedrb_general这个为初始化仓库的管理员用户名
>\# [sudo] install -o gitolite -g gitolite freedrb_general.pub /var/lib/gitolite/freedrb_general.pub

借gitolite的用户来执行 gitolite设置脚本
>\# sudo -u gitolite gitolite setup -pk /var/lib/gitolite/freedrb_general.pub

    Initialized empty Git repository in /var/lib/gitolite/repositories/gitolite-admin.git/
    Initialized empty Git repository in /var/lib/gitolite/repositories/testing.git/

    * 备注 /var/lib/gitolite 是gitolite安装好后会创建的gitolite家目录 准备好后直接执行4就会初始化两个git仓库 第一个是用来管理仓库以及用户的仓库，第二个是一个用来测试的仓库

> *暂时不想配上http的来访问git仓库*

## 本地设置以便克隆
设置ssh config 往里加个主机设置
>
    # vim ~/.ssh/config
    Host gitolite
    Hostname freedrb.design
    Port 22
    IdentifyFile ~/.ssh/id_rsa

然后克隆
>\# git clone gitolite:gitolite-admin

或者直接通过clone, 但我配私钥来，主要是处于安全考虑，服务器的ssh 没允许密码登录，只能通过私钥来连接
>\# git clone gitolite@server:gitolite-admin
weigu@weigu-pc ~> git clone gitolite:gitolite-admin
Cloning into 'gitolite-admin'...
remote: Enumerating objects: 6, done.
remote: Counting objects: 100% (6/6), done.
remote: Compressing objects: 100% (4/4), done.
remote: Total 6 (delta 0), reused 0 (delta 0)
Receiving objects: 100% (6/6), done.

到gitolite-admin去添加仓库
>\# cd gitolite-admin
>\# vim conf/gitolite.conf
>
    repo gitolite-admin
        RW+ = freedrb_general

    repo testing
        R = @all

    repo node-blog
    RW+ = @all

    repo learn
    RW+ = @all

需要添加用户时，直接在 gitolite-admin/keydir里添加公钥 username.pub username为该用户的用户名

新增git项目 推送上去
>
    # mkdir blog-node && cd blog-node

    # git init

    # git add .

    # git commit -m "inited"

    # git remote add origin gitolite:remote-repo

    # git push -u origin master




