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
namespace BTDate;

/**
 * note: return new DateTime object
 * @param \DateTime|string|null [$value]
 * @return \DateTime
 */
function ToDate($value = null) {
    if($value instanceof \DateTime) {
        $res = clone $value;
        return $res;
    }
    return $value === null ? (new \DateTime()) : (new \DateTime($value));
}

/**
 * note: return new DateTime object
 * @param \DateTime|string $date
 * @param int $newDay
 * @return \DateTime
 */
function SetDay($date, $newDay) {
    $date = ToDate($date);
    $date->setDate($date->format("Y"), $date->format("m"), $newDay);
    return $date;
}

/**
 * note: return new DateTime object
 * @param \DateTime|string $date
 * @return int
 */
function GetDayOfWeek($date) {
    return (intval(ToDate($date)->format("w")) + 6) % 7 + 1;
}

/**
 * note: return new DateTime object
 * @param \DateTime|string $date
 * @param int [$count]
 * @return \DateTime
 */
function AddDays($date, $count = 1) {
    $date = ToDate($date);
    if($count >= 0) {
        $date->add(new \DateInterval("P" . $count . "D"));
    } else {
        $date->sub(new \DateInterval("P" . abs($count) . "D"));
    }
    return $date;
}

/**
 * note: return new DateTime object
 * @param \DateTime|string $date
 * @param int [$count]
 * @return \DateTime
 */
function AddMonths($date, $count = 1) {
    $date = ToDate($date);
    if($count >= 0) {
        $date->add(new \DateInterval("P" . $count . "M"));
    } else {
        $date->sub(new \DateInterval("P" . abs($count) . "M"));
    }
    return $date;
}

/**
 * note: return new DateTime object
 * @param \DateTime|string $date1
 * @param \DateTime|string $date2
 * @return \DateTime
 */
function GetMaxDate($date1, $date2) {
    $d1 = ToDate($date1);
    $d2 = ToDate($date2);
    return $d1->diff($d2)->invert ? $d1 : $d2;
}

/**
 * note: return new DateTime object
 * @param \DateTime|string $date1
 * @param \DateTime|string $date2
 * @return \DateTime
 */
function GetMinDate($date1, $date2) {
    $d1 = ToDate($date1);
    $d2 = ToDate($date2);
    return $d1->diff($d2)->invert ? $d2 : $d1;
}

/**
 * @param \DateTime|string $date1
 * @param \DateTime|string $date2
 * @return int
 */
function GetIntervalInSeconds($date1, $date2) {
    $dd = ToDate($date1)->diff(ToDate($date2));
    return (((($dd->days * 24 + $dd->h) * 60 + $dd->i) * 60 + $dd->s) * ($dd->invert ? -1 : 1));
}

///**
// * @param \DateTime|string $start
// * @param \DateTime|string $end
// * @return int
// */
//function GetTimeIntervalInSeconds($start, $end) {
//    $d1 = ToDate($start);
//    $d2 = ToDate($end);
//    return $d2->getTimestamp() - $d1->getTimestamp();
//}

/**
 * @param \DateTime|string $date1
 * @param \DateTime|string $date2
 * @return int
 */
function GetIntervalInDays($date1, $date2) {
    $d1 = ToDate($date1);
    $d1->setTime(0, 0, 0);
    $d2 = ToDate($date2);
    $d2->setTime(0, 0, 0);
    $dd = ToDate($d1)->diff(ToDate($d2));
    return $dd->days;
}

/**
 * get difference in weeks based on mondays by dates
 * @param \DateTime|string $date1
 * @param \DateTime|string $date2
 * @return float
 */
function GetIntervalInWeeks($date1, $date2) {
    $d1 = GetStartOfWeek($date1);
    $d2 = GetStartOfWeek($date2);
    return floor($d1->diff($d2)->days / 7);
}

/**
 * note: return new DateTime object
 * @param \DateTime|string $date
 * @return \DateTime
 */
function GetStartOfWeek($date) {
    $date = ToDate($date);
    $date->setTime(0, 0, 0);
    $off = (intval($date->format("w")) + 6) % 7;
    if($off > 0) {
        $date->sub(new \DateInterval("P".$off."D"));
    }
    return $date;
}

/**
 * note: return new DateTime object
 * @param \DateTime|string $date
 * @param int $weekDay -- day for week: 1 - monday, 7 - sunday
 * @return \DateTime
 */
function GetDayOnCurrentWeek($date, $weekDay) {
    $date = ToDate($date);
    $date->setTime(0, 0, 0);
    $off = (intval($date->format("w")) + 6) % 7;
    $d2 = ($weekDay - 1) - $off;

    if($d2 < 0) {
        $date->sub(new \DateInterval("P".abs($d2)."D"));
    } else if($d2 > 0) {
        $date->add(new \DateInterval("P".$d2."D"));
    }

    return $date;
}

/**
 * @param \DateTime|string $start1
 * @param \DateTime|string $end1
 * @param \DateTime|string $start2
 * @param \DateTime|string $end2
 * @return \DateTime[]|null
 */
function GetCrossDatePeriod($start1, $end1, $start2, $end2) {
    $start1 = ToDate($start1);
    $end1 = ToDate($end1);
    $start2 = ToDate($start2);
    $end2 = ToDate($end2);

    $start1 = GetMaxDate($start1, $start2);
    $end1 = GetMinDate($end1, $end2);
    if($start1->diff($end1)->invert) {
        return null;
    }

    return array(
        "start" => $start1,
        "end" => $end1
    );
}

/**
 * @param \DateTime|string $start
 * @param \DateTime|string $end
 * @return int
 */
function CompareByDate($start, $end) {
    $d1 = ToDate($start);
    $d2 = ToDate($end);
    $d1->setTime(0,0,0);
    $d2->setTime(0,0,0);
    if($d1->diff($d2)->invert) return 1;
    if($d2->diff($d1)->invert) return -1;
    return 0;
}

/**
 * @param \DateTime|string $start
 * @param \DateTime|string $end
 * @return int
 */
function CompareByDateTime($start, $end) {
    $d1 = ToDate($start);
    $d2 = ToDate($end);
    if($d1->diff($d2)->invert) return 1;
    if($d2->diff($d1)->invert) return -1;
    return 0;
}

/**
 * @param \DateTime|string $date
 * @param string $time
 * @return \DateTime
 */
function SetTimeFromString($date, $time) {
    $date = ToDate($date);
    if(!$time) return $date;

    $tmp = preg_split("/:/", $time);
    if(sizeof($tmp) >= 2) {
        $date->setTime(intval($tmp[0]), intval($tmp[1]), sizeof($tmp) >= 3 ? intval($tmp[2]) : 0);
    }
    return $date;
}
