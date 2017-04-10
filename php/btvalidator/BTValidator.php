<?php
/*******************************************************************
 * @copyright © Aliaksei Puzenka, 2017.
 * @copyright © bytiger.com, 2017.
 * @version 1.0.1
 * @description
 * BTValidator is PHP class to validate arrays structure and data.
 * @license
 * This software is allowed to use under "GPL v3" (http://www.gnu.org/licenses/old-licenses/gpl-3.0.html)
 * or you need to obtain commercial license to use it in non-"GPL v3" project.
 * For more info please contact support@bytiger.com for details.
 *******************************************************************/

class BTValidator {

    const TYPE_NULL = "null";
    const TYPE_INT = "int";
    const TYPE_INT_OR_NULL = "int|null";
    const TYPE_FLOAT = "float";
    const TYPE_FLOAT_OR_NULL = "float|null";
    const TYPE_STRING = "string";
    const TYPE_STRING_OR_NULL = "string|null";
    const TYPE_BOOL = "bool";
    const TYPE_BOOL_OR_NULL = "bool|null";
    const TYPE_DATE = "date";
    const TYPE_DATE_OR_NULL = "date|null";
    const TYPE_ARRAY = "array";
    const TYPE_ARRAY_OR_NULL = "array|null";

    const TYPE_KEY = "key";
    const TYPE_KEY_OR_NULL = "key|null";
    const TYPE_EMAIL = "email";
    const TYPE_EMAIL_OR_NULL = "email|null";
    const TYPE_UUID = "uuid";
    const TYPE_UUID_OR_NULL = "uuid|null";
    const TYPE_COLOR = "color";
    const TYPE_COLOR_OR_NULL = "color|null";

    const KEY_CHAR = "$";

    /**
     * check is string contain integer value
     * @param string $str
     * @return bool
     */
    static public function isInt($str) {
        return !is_object($str) && !!preg_match("/^[-+]?\\d+$/", (string)$str);
    }

    /**
     * check is string contain number (float value)
     * @param string $str
     * @return bool
     */
    static public function isFloat($str) {
        return !is_object($str) && !!preg_match("/^[-+]?(\\d+(\\.\\d+)?|(\\.\\d+))$/", (string)$str);
    }

    /**
     * check string for ability to use as key-name value
     * note: started from letter and allowed only A-Z, - (dash), _ (underscore)
     * @param string $str
     * @return boolean -- is value is can be used as key
     */
    static public function isKeyName($str) {
        return !is_object($str) && is_string($str) && preg_match("/^[A-Za-z][A-Za-z0-9\\_\\-]*$/", $str);
    }

    /**
     * check string as email address
     * @param string $str
     * @return boolean -- is value is can be used as key
     */
    static public function isEmail($str) {
        return !is_object($str) && is_string($str) && filter_var($str, FILTER_VALIDATE_EMAIL);
    }

    /**
     * check string as CSS color value
     * @static
     * @param $str
     * @return bool
     */
    static public function isColorValue($str) {
        return !is_object($str) && is_string($str) && !!preg_match("/^(#[0-9a-f]{3}|#[0-9a-f]{6}|(rgb\\([0-9]{1,3}\\s*,\\s*[0-9\\.]{1,3}\\s*,\\s*[0-9]{1,3}\\))|(rgba\\([0-9]{1,3}\\s*,\\s*[0-9]{1,3}\\s*,\\s*[0-9]{1,3}\\s*,\\s*[0-9\\.]+\\)))$/", $str);
    }

    /**
     * check string for UUID value (like 550e8400-e29b-41d4-a716-446655440000)
     * @static
     * @param $str
     * @return bool
     */
    static public function isUUID($str) {
        return !is_object($str) && is_string($str) && !!preg_match("/^(#[0-9a-f]{8}\\-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/", $str);
    }

    /**
     * check is string contain number (float value)
     * @param string $str
     * @return DateTime|null
     */
    static public function parseDate($str) {
        $dd = null;
        try {
            $dd = new DateTime($str);
        } catch(Exception $e) {
            $dd = null;
        }
        return $dd;
    }

    /**
     * convert JSON array of integers to array
     * @param $str
     * @return array|bool
     */
    static public function JsonToIntArray(&$str) {
        if(!$str || !is_string($str)) return array();

        $res = array();
        $hasInvalid = false;
        $arr = json_decode($str);
        for($qq = 0; $qq < sizeof($arr); ++$qq) {
            if(self::isInt($arr[$qq])) {
                $res[] = intval($arr[$qq]);
            } else {
                $hasInvalid = true;
            }
        }
        $str = $res;
        return !$hasInvalid;
    }

    /**
     * convert string of integers separated by commas to array
     * @param string $str
     * @return bool
     */
    static public function StringToIntArray(&$str) {
        $res = array();
        $hasInvalid = false;
        $arr = preg_match("/,/", $str);
        for($qq = 0; $qq < sizeof($arr); ++$qq) {
            if(self::isInt($arr[$qq])) {
                $res[] = intval($arr[$qq]);
            } else {
                $hasInvalid = true;
            }
        }
        $str = $res;
        return !$hasInvalid;
    }

    /**
     * check string of numbers by Luhn algorithm
     * all non digit chars are skipped
     * doc: https://en.wikipedia.org/wiki/Luhn_algorithm
     * @param string $str
     * @return bool
     */
    static public function CheckByLuhnAlgorithm(&$str) {
        $s = strrev(preg_replace("/[^\\d]/", "", $str));
        $sum = 0;
        for ($i = 0, $j = strlen($s); $i < $j; ++$i) {
            $t = intval($s[$i]);
            $sum += ($i % 2 == 0) ? $t : ($t * 2 - (($t * 2) > 9 ? 9 : 0));
        }
        return (($sum % 10) == 0);
    }

    static public $lastCheckErrors = array();

    /**
     * @param array $obj -- the object to check
     * @param array|string $rules -- rules as array or JSON
     * @param bool [$doNotStop] -- do not stop on fail check
     * @return bool
     */
    static public function Check(&$obj, $rules, $doNotStop = false) {
        self::$lastCheckErrors = array();
        return self::_check($obj, $rules, $doNotStop);
    }

    static private function _check(&$obj, &$rules, $doNotStop) {
        $result = true;
        foreach($rules as $field => $rule) {
            if(substr($field, -1) === self::KEY_CHAR) continue;

            $types = array();
            if(is_string($rule)) {
                $types = preg_split("/\\|/", $rule);
            } else if(isset($rules[$field . self::KEY_CHAR]) && is_string($rules[$field . self::KEY_CHAR])) {
                $types = preg_split("/\\|/", $rules[$field . self::KEY_CHAR]);
            }

            $isCanBeNull = array_search(BTValidator::TYPE_NULL, $types) !== false;
            if(!isset($obj[$field]) || $obj[$field] === null) {
                if($isCanBeNull) {
                    $obj[$field] = null;
                } else {
                    self::$lastCheckErrors[] = "Cannot be NULL, field: " . $field . ", value: " . (isset($obj[$field]) ? preg_replace("/\n/", "", print_r($obj[$field], true)) : "");
                    $result = false;
                    if(!$doNotStop) return $result;
                }
                continue;
            }

            if(array_search(BTValidator::TYPE_INT, $types) !== false) {
                if(BTValidator::isInt($obj[$field])) {
                    $obj[$field] = intval($obj[$field]);
                    continue;
                } else {
                    self::$lastCheckErrors[] = "Not int value, field: " . $field . ", value: " . preg_replace("/\n/", "", print_r($obj[$field], true));
                    $result = false;
                    if(!$doNotStop) return $result;
                }
            }
            if(array_search(BTValidator::TYPE_FLOAT, $types) !== false) {
                if(BTValidator::isFloat($obj[$field])) {
                    $obj[$field] = floatval($obj[$field]);
                    continue;
                } else {
                    self::$lastCheckErrors[] = "Not float value, field: " . $field . ", value: " . preg_replace("/\n/", "", print_r($obj[$field], true));
                    $result = false;
                    if(!$doNotStop) return $result;
                }
            }
            if(array_search(BTValidator::TYPE_STRING, $types) !== false) {
                if(!is_string($obj[$field])) {
                    self::$lastCheckErrors[] = "Not string value, field: " . $field . ", value: " . preg_replace("/\n/", "", print_r($obj[$field], true));
                    $result = false;
                    if(!$doNotStop) return $result;
                }
                continue;
            }
            if(array_search(BTValidator::TYPE_BOOL, $types) !== false) {
                if(BTValidator::isInt($obj[$field])) {
                    $obj[$field] = !!intval($obj[$field]);
                    continue;
                } else if(strtolower($obj[$field]) === "true") {
                    $obj[$field] = true;
                    continue;
                } else if(strtolower($obj[$field]) === "false") {
                    $obj[$field] = false;
                    continue;
                } else {
                    self::$lastCheckErrors[] = "Not bool value, field: " . $field . ", value: " . preg_replace("/\n/", "", print_r($obj[$field], true));
                    $result = false;
                    if(!$doNotStop) return $result;
                }
            }
            if(array_search(BTValidator::TYPE_DATE, $types) !== false) {
                $date = self::parseDate($obj[$field]);
                if($date !== null) {
                    $obj[$field] = $date;
                    continue;
                } else {
                    self::$lastCheckErrors[] = "Not int value, field: " . $field . ", value: " . preg_replace("/\n/", "", print_r($obj[$field], true));
                    $result = false;
                    if(!$doNotStop) return $result;
                }
            }
            if(array_search(BTValidator::TYPE_ARRAY, $types) !== false) {
//                if(!is_array($obj[$field])) {
//                    self::$lastCheckErrors[] = "Not array, field: " . $field;
//                    $result = false;
//                } else {
//                    $result = self::_check($obj[$field], $rules) && $result;
//                }
//                continue;
            }
        }
        return $result;
    }

    static public function GetPost($name, $defValue = null, $type = null) {
        global $_POST;
        if(!array_key_exists($name, $_POST)) {
            return $defValue;
        }
        $tmp = get_magic_quotes_gpc() ? stripslashes($_POST[$name]) : $_POST[$name];
        switch($type) {
            case self::TYPE_INT: return self::isInt($tmp) ? intval($tmp) : $defValue;
            case self::TYPE_FLOAT: return self::isFloat($tmp) ? floatval($tmp) : $defValue;
            case self::TYPE_KEY: return self::isKeyName($tmp) ? $tmp : $defValue;
            case self::TYPE_EMAIL: return self::isEmail($tmp) ? $tmp : $defValue;
            case self::TYPE_UUID: return self::isUUID($tmp) ? $tmp : $defValue;
            case self::TYPE_COLOR: return self::isColorValue($tmp) ? $tmp : $defValue;
        }
        return  $tmp;
    }
};
