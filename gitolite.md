## install  gitolite
> yaourt gitolite
>  [archwiki](https://wiki.archlinux.org/index.php/Gitolite)
> 
    teemo@freedrb ~/> ls
    freedrb_general.pub
    teemo@freedrb ~/> sudo install -o gitolite -g gitolite freedrb_general.pub /var/lib/gitolite/freedrb_general.pub
    teemo@freedrb ~/> sudo -u gitolite gitolite setup -pk /var/lib/gitolite/freedrb_general.pub
    Initialized empty Git repository in /var/lib/gitolite/repositories/gitolite-admin.git/
    Initialized empty Git repository in /var/lib/gitolite/repositories/testing.git/

vim ~/.ssh/config
Host gitolite
Hostname freedrb.design
Port 22
IdentifyFile ~/.ssh/id_rsa

git clone gitolite@server:gitolite-admin
weigu@weigu-pc ~> git clone gitolite:gitolite-admin
Cloning into 'gitolite-admin'...
remote: Enumerating objects: 6, done.
remote: Counting objects: 100% (6/6), done.
remote: Compressing objects: 100% (4/4), done.
remote: Total 6 (delta 0), reused 0 (delta 0)
Receiving objects: 100% (6/6), done.

weigu@weigu-pc ~> cd gitolite-admin
weigu@weigu-pc ~> vim conf/gitolite.conf
>
    repo gitolite-admin
        RW+ = freedrb_general

    repo testing
        R = @all

    repo node-blog
    RW+ = @all

    repo learn
    RW+ = @all

新增git项目
weigu@weigu-pc ~/D/lzm> mkdir blog-node
weigu@weigu-pc ~/D/lzm> cd blog-node
weigu@weigu-pc ~/D/lzm> git init
weigu@weigu-pc ~/D/l/blog-node> git add .
weigu@weigu-pc ~/D/l/blog-node> git commit -m "inited"
weigu@weigu-pc ~/D/l/blog-node> git push -u origin master




