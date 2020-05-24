# blog_koa2
这是用nodejs koa2框架写的个人博客后台项目
### 问题总结

+ nodejs ER_ACCESS_DENIED_ERROR: Access denied for user 'yueyan'@'localhost' (using password: YES)
  + 原因：在端口3306上运行了其他MySQL服务器，使用不同的用户名和密码(应该是phpcustom导致的，虽然它并未启动)
  + 解决：试了好多方法，修改数据库root密码，创建新用户，都不行，然后就猜测是phpcustom占用mysql端口，通过启动phpcustom，卸载所有服务，再启动mysql，项目成功运行
  + 参考问题 https://stackoverflow.com/questions/40477625/nodejs-mysql-er-eccess-denied-error-access-denied-for-user-rootlocalhost