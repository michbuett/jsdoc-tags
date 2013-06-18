What is it?
-----------

It is a tool to create ctags-compatible tag information based on jsdoc comments.


How can I use it?
-----------------

Get [node.js](http://nodejs.org/download) and clone this repository - no strings attached.

Use ``node /path/to/jsdoc-tags --help`` to get usage informations.


Can I use it with [tagbar](http://majutsushi.github.io/tagbar/)?
-----------------------------------------------------------------

Of course, my friend, it's perfectly possible. Just add the following lines to your ``.vimrc``:

```vim
let g:tagbar_type_javascript = {
    \ 'ctagsbin': 'node',
    \ 'ctagsargs': '/path/to/jsdoc-tags -aq',
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


Can I use it with [Ctrlp.vim](http://kien.github.io/ctrlp.vim/)?
----------------------------------------------------------------

Totally. Just enable the tag extension and fly.

```vim
let g:ctrlp_extensions = ['tag']
```

You can also tell CtrlP to start with the tags. Just add the following line to your vim configuration:

```vim
let g:ctrlp_cmd = 'CtrlPTag'
```


How can I keep my tag files up to date?
---------------------------------------

It's very simple. Just add the following script to your ``.vimrc``:

```vim
autocmd BufWritePost *.js :call s:UpdateTags()
function! s:UpdateTags() abort
    let s:tagfiles = tagfiles()
    for s:file in s:tagfiles
        let s:path = fnamemodify(s:file, ':p:h')
        let s:cmd = 'node /path/to/jsdoc-tags -qpi -d ' . s:path . ' ' . expand('%:p')
        let s:result = system(s:cmd)
        if s:result != ''
            echoerr s:result
        endif
    endfor
endfunction
```

Or you can use [easytags.vim](https://github.com/xolox/vim-easytags), but I haven't tested it.


Can I still generate the API-Docs?
----------------------------------

Yes, you can. Just change the template using the ``--template`` option. There is still the original JsDoc template at ``templates/jsdoc/``.
