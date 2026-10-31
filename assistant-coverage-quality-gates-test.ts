import test from 'node:test';
import assert from 'node:assert/strict';
import manifest from './docs/assistant/coverage-manifest-25-stations.json';
import guides from './src/data/assistantStationGuides.json';
import pack from './src/data/assistantGrade1Research.json';

test('knowledge-depth manifest enumerates 25 true station IDs and all 121 real hotspot IDs',()=>{
  assert.equal(guides.length,25);
  assert.equal(manifest.stations.length,25);
  assert.equal(manifest.stations.reduce((sum,s)=>sum+s.hotspotCount,0),121);
  assert.equal(new Set(manifest.stations.map(x=>x.stationId)).size,25);
  const official=new Map(guides.map(x=>[x.stationId,x]));
  for(const s of manifest.stations){
    const g=official.get(s.stationId);
    assert.ok(g,s.stationId);
    assert.equal(s.title,g.title,s.stationId);
    assert.equal(s.hotspotCount,g.points.length,s.stationId);
    assert.deepEqual(s.hotspotIds,g.points.map(x=>x.pointId),s.stationId);
    assert.equal(s.topicClusters.length,5,s.stationId);
    assert.equal(s.verifiedByTeacher,false,'No automatic teacher approval is allowed');
    assert.equal(s.holdoutEvaluated,false,'No independent test result has been verified yet');
  }
});

test('research status truthfully distinguishes 1 draft station from 24 not specialized',()=>{
  const drafted=manifest.stations.filter(x=>x.researchStatus==='draft_in_pr72');
  const pending=manifest.stations.filter(x=>x.researchStatus==='not_yet_specialized');
  assert.deepEqual(drafted.map(x=>x.stationId),[pack.stationId]);
  assert.equal(pending.length,24);
  assert.equal(pack.entries.length,51);
  assert.equal(manifest.policy.releaseThresholds.stage2DirectAnswerLeaks,0);
});

test('release criteria are explicit quality goals, not a fabricated measured score',()=>{
  const rules=manifest.policy.releaseThresholds;
  assert.ok(rules.factAccuracyMin>=.95);
  assert.ok(rules.paraphraseIntentMin>=.9);
  assert.ok(rules.unsupportedAbstentionMin>=.95);
  assert.ok(manifest.stations.every(s=>s.independentScore===null&&s.factualUnitsCount===null));
  assert.match(manifest.purpose,/NOT achievements/);
});
