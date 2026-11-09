import React from 'react';
import {renderToStaticMarkup} from 'react-dom/server';
import assert from 'node:assert/strict';
import test from 'node:test';
import {GoogleTeacherLogin} from './src/components/auth/GoogleTeacherLogin';
test('Google button target is mounted before a user starts preparation, with a usable retry control',()=>{
 const html=renderToStaticMarkup(<GoogleTeacherLogin onLogin={()=>{}}/>);
 assert.match(html,/data-testid="google-signin-host"/);
 assert.match(html,/Tiếp tục với Google/);
 assert.ok(html.indexOf('google-signin-host')<html.indexOf('<button'));
});
