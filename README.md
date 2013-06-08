What is it?
-----------

It is a tool to create ctags-compatible tag information based on jsdoc comments.

How can I use it?
-----------------

Get [node.js](http://nodejs.org/download) and clone this repository - no strings attached.

Use ``node /path/to/jsdoc-tags --help`` to get usage informations.


Can I use it with the famous tagbar plugin?
-------------------------------------------

Yes, my friend, it's perfectly possible. Just add the following lines to your ``.vimrc``:

```vim
let g:tagbar_type_javascript = {
    \ 'ctagsbin': 'node',
    \ 'ctagsargs': '/path/to/jsdoc-tags -q -p',
    \ 'kinds': [
        \ 'c:classes',
        \ 'n:namespaces',
        \ 'p:properties:0:1',
        \ 'f:functions:0:1',
        \ 'e:event',
    \ ],
    \ 'kind2scope': {
        \ 'n' : 'namespace',
        \ 'c' : 'class'
    \ },
    \ 'scope2kind': {
        \ 'namespace': 'n',
        \ 'class': 'c'
    \ },
    \ 'sro': '.',
    \ 'replace': 1
\ }
```
We have to make sure that all possible types are listed in the 'kinds' section or tagbar will crash.
