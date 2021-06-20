<template>
  <div>
    

<div class="form-check container py-3">
  <input class="form-check-input" type="checkbox" value="" id="defaultCheck1">
  <label class="form-check-label" for="defaultCheck1">
    Keep rules synced accross computers
  </label>
</div>


    <div class="border mb-5">
      <div class="">
        <div class="bg-light py-4">
        <form class="container" v-on:submit.prevent="actionRule">
          <div
            v-if="isHelpDisplayed"
            class="alert alert-info d-flex"
            role="alert"
          >
            <div class="mr-2" style="white-space: pre-line">
              <div v-html="helpMessage"></div>
            </div>
            <button
              type="button"
              class="close ml-auto mb-auto"
              data-dismiss="alert"
              aria-label="Close"
              @click="hideHelp()"
            >
              <span aria-hidden="true">&times;</span>
            </button>
          </div>

          <div class="d-flex">
            <div class="form-group mr-2">
              <label for="inputEmail4">&nbsp;</label>

              <input
                type="checkbox"
                :true-value="settingOptions[1].value"
                :false-value="settingOptions[0].value"
                v-model="modelInputSetting"
                class="form-control btn toggle-switch switch-on-off"
              />
              

              <!--<label class="switch">
  <input type="checkbox">
  <span class="slider btn btn-success rounded"></span>
</label>-->

              <!--<select v-model="input.setting" class="custom-select" id="" required>
        <option :disabled="option.value == ''" v-for="option in settingOptions" v-bind:value="option.value">
        {{ option.text }}
      </option>
      </select>-->
            </div>
            <div class="form-group flex-shrink-1">
              <label for=""
                >Scheme
                <span class="badge badge-info" @click="showHelp('scheme')"
                  >?</span
                ></label
              >
              <select v-model="modelInputScheme" class="custom-select" id="">
                <option
                  :key="`option-${index}`"
                  :disabled="option.value == ''"
                  v-for="(option, index) in schemeOptions"
                  v-bind:value="option.value"
                >
                  {{ option.text }}
                </option>
              </select>
            </div>
            <div class="form-group ml-2 mr-2">
              <label for="">&nbsp;</label>
              <div class="form-control-plaintext">{{ schemeSuffix }}</div>
            </div>
            <!--<div class="form-group flex-grow-1">
      <label for="">Subdomain <span class="badge badge-info" data-balloon="Whats up!" data-balloon-pos="up">?</span></label>
      <input v-model="input.subdomain" type="text" class="form-control" id="" placeholder="" size="4">
    </div>
    <div class="form-group ml-2 mr-2">
      <label for="">&nbsp;</label>
      <div class="form-control-plaintext">.</div>
    </div>-->
            <div class="form-group flex-grow-1">
              <label for=""
                >Host<sup class="text-danger" title="required">*</sup>  <small>(domain, with optionnal subdomain or wildcard)</small>&nbsp;
                <span class="badge badge-info" @click="showHelp('host')"
                  >?</span
                ></label
              >
              <input
                v-model="modelInputHost"
                type="text"
                class="form-control"
                id=""
                placeholder="*.github.com"
                size="16"
                required
              />
            </div>
            <div class="form-group ml-2 mr-2">
              <label for="">&nbsp;</label>
              <div class="form-control-plaintext">/</div>
            </div>
            <div class="form-group mr-2">
              <label for=""
                >Path
                <span class="badge badge-info" @click="showHelp('path')"
                  >?</span
                ></label
              >
              <input
                v-model="modelInputPath"
                type="text"
                class="form-control"
                id=""
                placeholder="*"
                size="1"
                value="*"
                disabled
              />
            </div>

            <div class="form-group">
              <label for="inputEmail4">&nbsp;</label>
              <button
                :disabled="!isValidPrimaryPattern || isAnExistingRule"
                
                type="submit"
                class="btn form-control"
                :class="{'btn-primary': isValidPrimaryPattern || !isAnExistingRule, 'btn-outline-primary': !isValidPrimaryPattern || isAnExistingRule}"
              >
                {{ actionText }}
              </button>
            </div>
          </div>

          
        </form>
      </div>


        
        <div class="bg-white border-top mb-3">
        <div class="">
          <div class="container">
          <div class="d-flex align-items-center  py-3 px-0">
            <div class="input-group input-group-sm">
              <input
                v-model="modelFilterQuery"
                placeholder="Filter"
                type="text"
                class="form-control"
                aria-label="Small"
                aria-describedby="inputGroup-sizing-sm"
              />
            </div>


            
            <!--<div class="ml-auto mr-2 flex-shrink-0 text-secondary"><small>order by</small></div>
      
<div class="btn-group btn-group-sm" role="group" aria-label="First group">
    <button type="button" class="btn btn-outline-secondary">scheme</button>
    <button type="button" class="btn btn-outline-secondary">host</button>
    <button type="button" class="btn btn-outline-secondary">path</button>
    <button type="button" class="btn btn-outline-secondary">setting</button>
      </div>-->
          </div>

        <div class="mb-3">
          <div
            v-if="isAnExistingRule && !this.isEditMode"
            class="alert alert-warning"
            role="alert"
          >
            This rule already exists
          </div>

          <small v-if="!isValidPrimaryPattern" class="form-text text-muted"
            >To add a rule, enter a <b>host</b>, like <code>github.com</code>, <code>gist.github.com</code>, or <code>*.github.com</code>
          </small>

          <p class="mb-0 px-4" v-if="isValidPrimaryPattern">
            
            <span :class="'badge badge-' + colorClass">{{
              modelInputSetting
            }}</span>
            <span class="badge badge-light">{{ getPrimaryPattern }}</span>
          </p>
        </div>

          <ul class="list-group list-grou-flush">
            <li
              :key="item + index"
              class="list-group-item d-flex align-items-center"
              :class="{ 'list-group-item-warning': item.index === getEditedRuleIndex }"
              v-for="(item, index) in filteredRules"
            >
              <span
                :class="
                  ' align-middle badge badge-' +
                  getColorClass(item.rule.setting)
                "
                >{{ item.rule.setting }}</span
              >
              <span class="badge align-middle">{{
                item.rule.primaryPattern
              }}</span>
              
              <button
                v-if="item.index !== getEditedRuleIndex"
                @click="editRule(item.index)"
                type="button"
                class="btn btn-sm btn-outline-secondary ml-auto"
              >
                edit
              </button>
              <button
                v-if="item.index === getEditedRuleIndex"
                @click="cancelEditRule()"
                type="button"
                class="btn btn-sm btn-outline-secondary ml-auto"
              >
                cancel
              </button>
              <button
                @click="removeRule(item.index)"
                type="button"
                class="btn btn-sm btn-outline-danger ml-2"
              >
                remove
              </button>
            </li>
          </ul>
        </div>
        </div>
      </div>
      </div>

    </div>

    
    <div class="d-flex flex-row">
      

      <div class="d-flex flex-column ml-auto text-right px-4">
        <h6>Help</h6>
        <ul class="list-unstyled">
          <li class="">
            <a href="https://developer.chrome.com/extensions/match_patterns"
              >Match Patterns</a
            >
          </li>
          <li class="">
            <a
              href="https://developer.chrome.com/extensions/contentSettings#pattern-precedence"
              >Pattern precedence</a
            >
          </li>
        </ul>
      </div>
    </div>

    <!-- <div style="width: 80%; display:block; overflow:hidden;">
    <pre style="max-width: 80%;">{{exportedRules}}</pre>
    </div> -->
    <!-- <link
      rel="stylesheet"
      href="https://stackpath.bootstrapcdn.com/bootstrap/4.1.0/css/bootstrap.min.css"
      integrity="sha384-9gVQ4dYFwwWSjIDZnLEWnxCjeSWFphJiwGPXr1jddIhOegiu1FwO5qRGvFXOdJZ4"
      crossorigin="anonymous"
    /> -->
  </div>
</template>

<script lang="ts">
import { getStorageMethod } from "@/entry/background/storage";
import { defineComponent, onMounted } from "vue";
import {
  useState,
  useComputed,
  useMethods,
  initWatchers,
} from "../entry/options";
export default defineComponent({
  name: "App",
  components: {},
  setup() {
    const { fetchRules } = useMethods();

    initWatchers();

    onMounted(async () => {
      await fetchRules();

      chrome.storage.onChanged.addListener(async () => {
        await fetchRules();
      })
    });

    return {
      ...useState(),
      ...useComputed(),
      ...useMethods(),
    };
  },
});
</script>

<style lang="scss">
@import "../entry/options.scss";

</style>
