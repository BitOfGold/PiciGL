<?php

$consts = file_get_contents('constants.txt');
$consts = explode(',',$consts);
$const_rp = [];
foreach ($consts as $c) {
    $c = explode(':',$c);
    $const_rp[] = [
        'f'=>"gl.$c[0]",
        't'=>$c[1],
        'l'=>strlen($c[0])
    ];
}
usort($const_rp, function ($item1, $item2) {
    return $item2['l'] <=> $item1['l'];
});
$const_s = [];
$const_r = [];
foreach ($const_rp as $k => $rp) {
    $const_s[] = $rp['f'];
    $const_r[] = $rp['t'];
}

$repl = [
    'Float32Array.BYTES_PER_ELEMENT'=>4,
];
foreach ($repl as $key => $value) {
    $const_s[] = $key;
    $const_r[] = $value;
}


$jsd = '';
$jsnd = '';
$js = file('./picigl.js');
foreach ($js as $row) {
    $row = str_replace($const_s, $const_r, $row);
    if (strpos($row,"DEBUG") === false) {
        $jsnd .= trim($row)."\n";
    }
    $jsd .= trim($row)."\n";
}

file_put_contents('tmp/picigl.nodebug.js',$jsnd);
file_put_contents('tmp/picigl.debug.js',$jsd);

echo "OK\n";
