amazon-shop-tool
================

Command line tools for amazon web shop


Requirements
------------
- node.js


Installation
------------

	$ git clone git@github.com:kobake/amazon-shop-tool.git
	$ cd amazon-shop-tool
	$ npm install
	$ chmod +x amazon-order-history


Usage: amazon-order-history
---------------------------
Print your all order history as csv format.

	$ ./amazon-order-history
	Email: (Input your email for amazon.co.jp)
	Password: (Input your password for amazon.co.jp)


### Output sample

	222-2222222-2222222,2010年12月18日,￥2100,注文が確定しました,YOURNAME,暗号解読〈上〉
	111-1111111-1111111,2010年10月30日,￥4195,注文が確定しました,YOURNAME,人月の神話


License
-------
    The MIT License (MIT)
    
    Copyright (c) 2014 kobake
    
    Permission is hereby granted, free of charge, to any person obtaining a copy
    of this software and associated documentation files (the "Software"), to deal
    in the Software without restriction, including without limitation the rights
    to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
    copies of the Software, and to permit persons to whom the Software is
    furnished to do so, subject to the following conditions:
    
    The above copyright notice and this permission notice shall be included in all
    copies or substantial portions of the Software.
    
    THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
    IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
    FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
    AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
    LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
    OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
    SOFTWARE.
