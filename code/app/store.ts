import Vue from 'nativescript-vue';
import {NmapAddress, NmapHost} from "~/netutils";

export const globalState : {
    scanlist: NmapHost[],
    portBehaviour: any,
    nmapStarted: boolean,
    tcpStarted: boolean,
    selectedInterface: string | null,
    networkInterfaces: string[],
  } = Vue.observable(
  {
    scanlist: [],
    portBehaviour: {},
    nmapStarted: false,
    tcpStarted: false,
    selectedInterface: null,
    networkInterfaces: [],
  }
);
