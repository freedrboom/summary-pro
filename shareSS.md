### 背景
最近vultr上的学习（虚拟）主机，访问不进去了；买一个专门的又不太想，但又需要科学上网来搬砖；只好把目标转向同事的机子了（大家都在同一个局域网）,目前我用了两种方式吧
windows ss客户端本身就支持允许局域网的来连接，无需处理，但mac上的ss客户端或者lantern客户端就有点坑，只允许本机的请求，有点坑，只能做代理或者中转为本机的请求

#### ssh端口转发
```
# vim /etc/ssh/sshd_config
GatewayPorts　yes ## 修改下这个

# ssh -L 1080:127.0.0.1:34895 -fN user@ip
将本机的1080端口（请求）映射到对方的本机的34895端口上


# ssh -CqTfnN -R 0.0.0.0:2018:192.168.0.147:80 freedrb
将远程的2018 端口映射到本机的80端口， 可以在远程上其服务，访问的时候转到本地服务
```

#### 在对方机子上装个privoxy（请求转换）
```
    # 找到配置文件 监听个端口
    listen-address 0.0.0.0:1080
    # 设置转发到本地的 socks5 代理客户端端口
    # 转发到代理工具监听的端口上
    forward-socks5 / 127.0.0.1:1086 ## ss的
    forward-socks / 127.0.0.1:34895 ## lantern的
```

### 题外话
通过上面的步骤，能转发并蹭同事的科学上网成功了，但路由器并没有将mac地址与ip绑定，经常变化ip 有点头疼；
```
nmap，是Linux下的网络扫描和嗅探工具包，　我通过这个来扫描特定端口, 没装过的根据自己的环境装下
比如我这边是 yaourt -S nmap

＃sudo nmap -sS -p1080 192.168.1.168　// 支持网段扫面 192.168.1.1/24
Starting Nmap 7.70 ( https://nmap.org ) at 2019-07-10 10:57 CST
Nmap scan report for 192.168.1.168
Host is up (0.054s latency).

PORT     STATE SERVICE
1080/tcp open  socks
MAC Address: 50:2B:73:DC:5A:0D (Tenda Technology,Ltd.Dongguan branch)

Nmap done: 1 IP address (1 host up) scanned in 0.35 seconds

扫一个特定的端口和ip返回的数据如上

```
所以得找些关键字啥的来找到同事的ip, 如我的是根据上面的数据脚本如下, 扫描局域网的的所有ip的1080端口，　用grep（以行来过滤）根据tcp open 过滤并显示 往前四行，往后四行；再根据report过滤一遍 并用awk来切出ip（以空格分开的第五列)

> \# sudo nmap -sS -p1080 192.168.1.1/24 | grep -A 1 -B 4 "tcp open" |grep report |  awk -F[:" "]+ '{print $5}'
