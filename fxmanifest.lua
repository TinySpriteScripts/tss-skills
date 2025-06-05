fx_version 'cerulean'
game 'gta5'
lua54 'yes'

author 'TinySprite Scripts'
description 'tss-skills'
version '1.2.0'

shared_scripts {
    -- '@ox_lib/init.lua',
    'shared/*.lua',
    '@jim_bridge/starter.lua',
}

client_scripts {
    'client/*.lua',
}

server_scripts {
    '@oxmysql/lib/MySQL.lua',
    'server/*.lua',
}

ui_page 'html/index.html'

files {
    'html/images/*.png',
    'html/images/*.jpg',
    'html/*.html',
    'html/*.js',
    'html/*.css'
}

dependency 'jim_bridge'