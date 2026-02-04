<template>
  <Page>
    <ActionBar>
      <Label text="Home" class="font-bold text-lg"/>
      <ActionItem text="Devices" android.position="actionBar" @tap="goToDevices"/>
    </ActionBar>

    <StackLayout>
      <Label class="text-xl align-middle text-center text-gray-500" :text="message" @tap="logMessage" />
      <Button text="Scan Network" col="1" @tap="netutils.runNmapScan()"></Button>
    </StackLayout>
  </Page>
</template>

<script lang="ts">
  import Vue from "nativescript-vue";
  import DeviceList from "@/components/DeviceList.vue";
  import { Utils } from "@nativescript/core"
  import * as netutils from "~/netutils";
  import * as tcpdump from "~/tcpdump";

  export default Vue.extend({
    computed: {
      message() {
        return "This is the homepage";
      },
    },
    data() {
      return {
        netutils: netutils,
      }
    },
    methods: {
      logMessage() {
        console.log('You have tapped the message!')
      },

      goToDevices() {
        this.$navigateTo(DeviceList)
      }
    },

    mounted() {
      tcpdump.getRoot()
      tcpdump.getPackets()
    }
  });
</script>

<style>
</style>
