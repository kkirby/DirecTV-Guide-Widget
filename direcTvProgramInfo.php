<?php

$listUrl = 'http://www.directv.com/entertainment/data/guideScheduleSegment.json.jsp';

$contents = json_decode(file_get_contents($listUrl . '?' . http_build_query($_GET)));

function getProgramInfo($tinyUrl){
	$ch = curl_init();
	curl_setopt($ch,CURLOPT_URL,$tinyUrl);
	curl_setopt($ch,CURLOPT_USERAGENT,'User-Agent:Mozilla/5.0 (Macintosh; Intel Mac OS X 10_7_3) AppleWebKit/534.53.11 (KHTML, like Gecko) Version/5.1.3 Safari/534.53.10');
	curl_setopt($ch,CURLOPT_FOLLOWLOCATION,true);
	ob_start();
	curl_exec($ch);
	
	$doc = new DOMDocument;
	@$doc->loadHTML(ob_get_clean());
	$xpath = new DOMXpath($doc);
	
	$imageUri = $xpath->query('//div[@class="details-movie-cover-border"]/img/@src')->item(0)->value;
	$description = $xpath->query('//div[@class="details_tab_content-split"]/p')->item(0)->textContent;
	
	return array($imageUri,$description);
}

foreach($contents->channels as $channel){
	foreach($channel->schedules as $schedule){
		list($schedule->poster,$schedule->info) = getProgramInfo($schedule->tinyUrl);
	}
}

echo json_encode($contents);

?>