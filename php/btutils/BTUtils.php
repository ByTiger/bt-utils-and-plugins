<?php
/*******************************************************************
 * @copyright © Aliaksei Puzenka, 2017.
 * @copyright © bytiger.com, 2017.
 * @version 1.0.1
 * @description
 * BTValidator is PHP class to validate arrays structure and data.
 * @license
 * This software is allowed to use under GPL or you need to obtain commercial license
 * to use it in non-GPL project. Please contact sales@bytiger.com for details
 *******************************************************************/
namespace BTUtils;

function GetClientIp() {
    $ipaddress = '';
    if(getenv('HTTP_CLIENT_IP')) {
        $ipaddress = getenv('HTTP_CLIENT_IP');
    } else if(getenv('HTTP_X_FORWARDED_FOR')) {
        $ipaddress = getenv('HTTP_X_FORWARDED_FOR');
    } else if(getenv('HTTP_X_FORWARDED')) {
        $ipaddress = getenv('HTTP_X_FORWARDED');
    } else if(getenv('HTTP_FORWARDED_FOR')) {
        $ipaddress = getenv('HTTP_FORWARDED_FOR');
    } else if(getenv('HTTP_FORWARDED')) {
        $ipaddress = getenv('HTTP_FORWARDED');
    } else if(getenv('REMOTE_ADDR')) {
        $ipaddress = getenv('REMOTE_ADDR');
    } else {
        $ipaddress = 'UNKNOWN';
    }
    return $ipaddress;
}

/**
 * retrieve image file as base64 string for IMG.src
 * supported type see in code ;)
 * @param string $fullPath -- path to file
 * @return string
 */
function GetFileInBase64($fullPath) {
    if(!is_file($fullPath) || !file_exists($fullPath)) {
        return "";
    }

    $data = file_get_contents($fullPath);
    if($data === false) {
        return "";
    }

    if(preg_match("/\\.jpg$/", $fullPath)) {
        $prefix = "data:image/jpeg;base64,";
        return $prefix . base64_encode($data);
    } else if(preg_match("/\\.jpeg$/", $fullPath)) {
        $prefix = "data:image/jpeg;base64,";
        return $prefix . base64_encode($data);
    } else if(preg_match("/\\.gif/", $fullPath)) {
        $prefix = "data:image/gif;base64,";
        return $prefix . base64_encode($data);
    } else if(preg_match("/\\.png/", $fullPath)) {
        $prefix = "data:image/png;base64,";
        return $prefix . base64_encode($data);
    } else if(preg_match("/\\.bmp/", $fullPath)) {
        $prefix = "data:image/bmp;base64,";
        return $prefix . base64_encode($data);
    }
    return "";
}
