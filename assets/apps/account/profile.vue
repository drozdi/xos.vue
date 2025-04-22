<template>
  <win-form draggable resizable overflow :is-header="false"
            :w="800" :h="600" :icons="['collapse', 'fullscreen', 'close']"
            @saved="onSaved" @updated="onUpdated" @loaded="onLoaded"
            source="/api/account"
            update="/api/account">
    <div class="q-pa-sm">
        <input :="hidden('id')" />
        <div class="row">
          <div class="col-6">
            <q-input :="register('email')" :label="t('props.email')" clearable />
            <q-input :="register('alias')" :label="t('props.alias')" clearable />
            <q-input :="register('second_name')" :label="t('props.second_name')"  clearable />
            <q-input :="register('first_name')" :label="t('props.first_name')" clearable />
            <q-input :="register('patronymic')" :label="t('props.patronymic')" clearable />
          </div>
          <div class="col-6">
            <q-list>
              <q-item v-if="data.tutor">
                <q-item-section>
                  <q-item-label caption>{{t('props.tutor')}}</q-item-label>
                  <q-item-label>{{ data.tutor }}</q-item-label>
                </q-item-section>
              </q-item>
              <q-item v-if="data.date_register">
                <q-item-section>
                  <q-item-label caption>{{t('props.dateRegister')}}</q-item-label>
                  <q-item-label>{{ data.date_register }}</q-item-label>
                </q-item-section>
              </q-item>
              <q-item v-if="data.lastLogin">
                <q-item-section>
                  <q-item-label caption>{{t('props.lastLogin')}}</q-item-label>
                  <q-item-label>{{ data.last_login }}</q-item-label>
                </q-item-section>
              </q-item>
              <q-item v-if="data.x_timestamp">
                <q-item-section>
                  <q-item-label caption>{{t('props.xTimestamp')}}</q-item-label>
                  <q-item-label>{{ data.x_timestamp }}</q-item-label>
                </q-item-section>
              </q-item>
            </q-list>
          </div>
        </div>
        <q-input :="register('password')" autocomplete="new-password"
                 :label="t('props.password')"
                 :type="passwordShow ? 'text' : 'password'">
          <template v-slot:append>
            <q-icon :name="passwordShow ? 'visibility_off' : 'visibility'" class="cursor-pointer" @click="passwordShow = !passwordShow"/>
          </template>
        </q-input>
        <q-input :="register('confirm_password')" autocomplete="new-password"
            :label="t('props.confirm_password')"
            :type="сonfirmPasswordShow? 'text' : 'password'"
            :rules="confirmPasswordRules">
          <template v-slot:append>
            <q-icon :name="сonfirmPasswordShow ? 'visibility_off' : 'visibility'" class="cursor-pointer" @click="сonfirmPasswordShow = !сonfirmPasswordShow"/>
          </template>
        </q-input>
        <q-input :="register('description')" type="textarea" :label="t('props.description')" />
      </div>

    <template #footer="{ loading, save }">
      <div class="col">
        <q-btn :loading="loading" type="submit" color="green" @click="save(false)">
          {{ $t('btn.save') }}
        </q-btn>
      </div>
    </template>
  </win-form>
</template>

<script>
import winForm from "../../components/windows/winForm";
import xRow from "../../components/row/xRow";
import { useApp } from "../../composables/useApp";
import { useForm } from "../../composables/useForm";
import { useI18n } from "../../composables/useI18n";


export default {
  name: "account-profile",
  components: {
    winForm, xRow
  },
  setup () {
    useApp({
      i18nKey: 'account'
    })
    const { data, errors,
      register, component, hidden } = useForm({}, {
      rules: {
        alias: [
          v => !!v || 'Обязательно',
          v => (v && v.length >= 6) || 'Обращение должен быть больше 6 симоволов',
        ],
        email: [
          v => !!v || 'Обязательно',
        ],
        first_name: [
          v => !!v || 'Обязательно',
        ],
        second_name: [
          v => !!v || 'Обязательно',
        ],
        patronymic: [
          v => !!v || 'Обязательно',
        ],
        password: [
          v => !v || v.length >= 6 || 'Минимум 6 символов',
          /*value => {
            const pattern = /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#\$%\^&\*])(?=.{8,})/;
            return (
                pattern.test(value) ||
                "Min. 8 characters with at least one capital letter, a number and a special character."
            )
          },*/
        ]
      },
    })

    return  {
      t: useI18n('account').t,
      data, errors, register, component, hidden
    }
  },
  data: () => ({
    passwordShow: false,
    сonfirmPasswordShow: false,
  }),
  computed: {
    confirmPasswordRules () {
      return [() => (this.data.password === this.data.confirm_password) || "Password must match."];
    },
  },
  methods: {
    onSaved () {
      const { dispatch } = this.$store;
      dispatch('authentication/check');
    },
    onUpdated () {

    },
    onLoaded () {
      this.data.password = ''
      this.data.confirm_password = ''
      this.passwordShow = false
      this.сonfirmPasswordShow = false
    }
  },
  mounted () {

  }
}
</script>

<style scoped>

</style>