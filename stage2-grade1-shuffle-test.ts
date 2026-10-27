import {test} from 'node:test';
import assert from 'node:assert/strict';
import {grade1SharedConfigs} from './src/games/stage2/grade1';
import {shuffleGrade1} from './src/games/stage2/grade1/shuffle';
import {isCorrectMatch} from './src/games/stage2/state';

test('five grade-one stations retain all correct content through shuffled positions',()=>{
  for(const original of Object.values(grade1SharedConfigs))for(const random of [()=>0,()=>0.49,()=>0.99]){
    const shuffled=shuffleGrade1(original,random);
    assert.equal(shuffled.questions[1],original.questions[1]);
    for(const index of [0,3]){
      const before=original.questions[index],after=shuffled.questions[index];
      if(before.kind==='match'||after.kind==='match')throw new Error('Expected choices');
      assert.equal(after.options[after.answer],before.options[before.answer]);
      if(before.answers)assert.deepEqual(after.answers!.map(i=>after.options[i]).sort((a,b)=>a.text.localeCompare(b.text)),before.answers.map(i=>before.options[i]).sort((a,b)=>a.text.localeCompare(b.text)));
    }
    const before=original.questions[2],after=shuffled.questions[2];
    if(before.kind!=='match'||after.kind!=='match')throw new Error('Expected match');
    assert.deepEqual(after.left,before.left);
    before.solution.forEach((right,left)=>assert.equal(after.right[after.solution[left]],before.right[right]));
    assert.ok(isCorrectMatch(after.solution,Object.fromEntries(after.solution.map((right,left)=>[left,right]))));
  }
});
