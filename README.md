What is it?
-----------

It is a tool to create ctags-compatible tag information based on jsdoc comments

How can I use it?
-----------------

Get [node.js](http://nodejs.org/download) and clone this repository.

Use ``node /path/to/jsdoc-tags --help`` to get usage informations.


Can I use it with the famous tagbar plugin?
-------------------------------------------

Yes, my friend, you can. Just add the following lines to your ``.vimrc``:
```vim
let g:tagbar_type_javascript = {
    \ 'ctagsbin': 'node',
    \ 'ctagsargs': 'C:\Users\michael\Workspace\jsdoc-tags -q -a',
    \ 'kinds': [
        \ 'c:classes',
        \ 'v:variables',
        \ 'p:properties:0:1',
        \ 'f:functions:0:1',
        \ 'e:events',
    \ ],
    \ 'replace': 1
\ }
```
