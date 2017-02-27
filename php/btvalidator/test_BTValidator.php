<?php
header("Content-type: text/plain");
require_once ("BTValidator.php");

$obj = array(
    "int_as_str" => "1",
    "int" => 1,
    "float" => 1.5,
    "string" => "a",
    "null" => null,
    "empty_string" => "",
    "true" => true,
    "empty_array" => array(),
    "array" => array(5,7,8),
    "datetime" => new DateTime()
);

echo "Source array:\n";
print_r($obj);

echo "Check 'BTValidator::TYPE_INT' type";
echo BTValidator::Check($obj, array(
    "int_as_str"    => BTValidator::TYPE_INT,
    "int"           => BTValidator::TYPE_INT,
    "float"         => BTValidator::TYPE_INT,
    "string"        => BTValidator::TYPE_INT,
    "null"          => BTValidator::TYPE_INT,
    "empty_string"  => BTValidator::TYPE_INT,
    "true"          => BTValidator::TYPE_INT,
    "empty_array"   => BTValidator::TYPE_INT,
    "array"         => BTValidator::TYPE_INT,
    "datetime"      => BTValidator::TYPE_INT,
    "not_defined"   => BTValidator::TYPE_INT
), true) ? "- success\n" : "- fail\n";
print_r(BTValidator::$lastCheckErrors);

echo "Check 'BTValidator::TYPE_FLOAT' type";
echo BTValidator::Check($obj, array(
    "int_as_str"    => BTValidator::TYPE_FLOAT,
    "int"           => BTValidator::TYPE_FLOAT,
    "float"         => BTValidator::TYPE_FLOAT,
    "string"        => BTValidator::TYPE_FLOAT,
    "null"          => BTValidator::TYPE_FLOAT,
    "empty_string"  => BTValidator::TYPE_FLOAT,
    "true"          => BTValidator::TYPE_FLOAT,
    "empty_array"   => BTValidator::TYPE_FLOAT,
    "array"         => BTValidator::TYPE_FLOAT,
    "datetime"      => BTValidator::TYPE_FLOAT,
    "not_defined"   => BTValidator::TYPE_FLOAT
), true) ? " - success\n" : " - fail\n";
print_r(BTValidator::$lastCheckErrors);

//
//
//
//$obj = array(
//    "a1" => "1",
//    "a2" => "1.5",
//    "a3" => "hello",
//    "a4" => null,
//    "b" => array(1,2,3,4,5,6),
//    "b1" => array(),
//    "b2" => null,
//    "c" => array("aaa",2,"sss",4,5,"ddd"),
//    "d" => array(1,2,null,4,5,6),
//    "e" => array("aaa",2,"sss",null,5,"ddd"),
//    "f" => array(
//        "a" => 1,
//        "b" => null,
//        "c" => ""
//    )
//);
//
//BTValidator::Check($obj, array(
//    "a1" => BTValidator::TYPE_INT,
//    "a2" => BTValidator::TYPE_FLOAT,
//    "a3" => BTValidator::TYPE_STRING,
//    "a4" => BTValidator::TYPE_INT_OR_NULL,
//    "b" => array(BTValidator::TYPE_INT),
//    "b1$" => BTValidator::TYPE_ARRAY_OR_NULL,
//    "b1" => array(BTValidator::TYPE_INT),
//    "b2$" => BTValidator::TYPE_ARRAY_OR_NULL,
//    "b2" => array(BTValidator::TYPE_INT),
//    "c" => array(BTValidator::TYPE_STRING),
//    "d" => array(BTValidator::TYPE_INT_OR_NULL),
//    "e" => array(BTValidator::TYPE_STRING_OR_NULL),
//    "f$" => BTValidator::TYPE_ARRAY_OR_NULL,
//    "f" => array(
//        "a" => BTValidator::TYPE_INT_OR_NULL,
//        "b" => BTValidator::TYPE_INT_OR_NULL,
//        "c" => BTValidator::TYPE_INT_OR_NULL
//    )
//));
