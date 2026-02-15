import Vue from 'nativescript-vue';

export const globalState = Vue.observable(
  {
    scanlist: [],
  }
);
