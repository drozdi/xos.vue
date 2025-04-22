<template>
  <q-btn flat square color="secondary" padding="12px" icon="mdi-menu-open">
    <q-menu max-height="500px" style="width: 500px">
     <div class="row no-wrap">
        <div class="col">
          <q-list>
            <q-item clickable v-close-popup @click="createProfile">
              <q-item-section avatar>
                <q-icon name="mdi-account" />
              </q-item-section>
              <q-item-section>
                {{ user.alias }}
              </q-item-section>
            </q-item>
            <q-separator />
            <q-item clickable v-close-popup @click="logout">
              <q-item-section avatar>
                <q-icon name="mdi-power" />
              </q-item-section>
              <q-item-section>
                Выход
              </q-item-section>
            </q-item>
          </q-list>
        </div>
        <q-separator vertical class="q-mx-lg" />
        <div class="col">
          <q-list dense padding style="min-width: 200px; min-height: 300px">
            <template v-for="item in list">
              <template v-if="item.subs && item.subs.length">
                <q-expansion-item dense expand-separator :icon="item.icon" :label="item.title">
                  <q-list dense>
                    <q-item v-for="sub in item.subs" clickable v-close-popup :inset-level="0.5" @click="createApp(sub.app)">
                      <q-item-section v-if="sub.icon" avatar>
                        <q-icon color="primary" :name="sub.icon" />
                      </q-item-section>
                      <q-item-section>{{ sub.title }}</q-item-section>
                      <template v-if="sub.subs && sub.subs.length">
                        <q-item-section side>
                          <q-icon name="keyboard_arrow_right" />
                        </q-item-section>
                        <q-menu anchor="top end" self="top start">
                          <q-list>
                            <q-item v-for="ss in sub.subs" dense clickable v-close-popup="2" @click="createApp(ss.app)">
                              <q-item-section v-if="ss.icon" avatar>
                                <q-icon color="primary" :name="ss.icon" />
                              </q-item-section>
                              <q-item-section>{{ ss.title }}</q-item-section>
                            </q-item>
                          </q-list>
                        </q-menu>
                      </template>
                    </q-item>
                  </q-list>
                </q-expansion-item>
              </template>
              <template v-else>
                <q-item clickable v-close-popup @click="createApp(item.app)">
                  <q-item-section v-if="item.icon" avatar>
                    <q-icon color="primary" :name="item.icon" />
                  </q-item-section>
                  <q-item-section>{{ item.title }}</q-item-section>
                </q-item>
              </template>
            </template>
          </q-list>
        </div>
      </div>
    </q-menu>
  </q-btn>
</template>

<script>
import { QBtn, QMenu, QItem, QSeparator, QItemSection, QList, QIcon, QExpansionItem } from "quasar";


import { appsManager } from "../apps/core";
import { mapState, mapGetters } from 'vuex';

export default {
  components: { QBtn, QMenu, QItem, QSeparator, QItemSection, QList, QIcon, QExpansionItem },
  name: "start-menu",
  data () {
    return {
      drawer: true,
      mini: true,
      list: [{
        title: 'Main',
        icon: 'mdi-domain',
        subs: [{
          title: 'OU',
          icon: 'mdi-account-group-outline',
          app: "./main/ous"
        },{
          title: 'Claimant',
          icon: 'mdi-clipboard-alert-outline',
          app: "./main/claimants"
        },{
          title: 'Users',
          icon: 'mdi-account-multiple-outline',
          app: "./main/users"
        },{
          title: 'Groups',
          icon: 'mdi-account-group-outline',
          app: "./main/groups"
        }]
      }, {
        title: 'Устойства',
        icon: 'mdi-devices',
        subs: [{
          title: 'Общие свойства',
          icon: 'mdi-view-list',
          app: "./device/properties"
        }, {
          title: 'Техника',
          icon: 'mdi-devices',
          subs: [{
            title: 'Список',
            icon: 'mdi-devices',
            app: "./device/devices"
          }, {
            title: 'Типы',
            icon: 'mdi-group',
            app: "./device/types"
          }],
        }, {
          title: 'Компаненты',
          icon: 'mdi-home-group-minus',
          subs: [{
            title: 'Список',
            icon: 'mdi-devices',
            app: "./device/sub-devices"
          }, {
            title: 'Типы',
            icon: 'mdi-home-group-minus',
            app: "./device/components"
          }]
        }, {
          title: 'Программы',
          icon: 'mdi-microsoft-access',
          subs: [{
            title: 'Список',
            icon: 'mdi-microsoft-access',
            app: "./device/softwares",
          }, {
            title: 'Лицензии',
            icon: 'mdi-devices',
            app: "./device/licenses"
          }, {
            title: 'Типы',
            icon: 'mdi-select-group',
            app: "./device/software/types"
          }],
        }]
      }]
    };
  },
  methods: {
    calcMenu () {
      console.log(arguments)
      return {
        'min-width': '200px',
        'max-height': '300px'
      }
    },
    createApp (app) {
      if (!app) { return }
      appsManager.createApp(app)
    },
    logout () {
      const { dispatch } = this.$store;
      dispatch('authentication/logout');
    },
    createProfile () {
      appsManager.createProfile({});
    }
  },
  computed: {
    ...mapState('authentication', {
      user: state => state.user || {},
    })
  }
}
</script>