<template>
  <b-nav-item-dropdown :class="userStyle">
    <template v-if="user.pic" v-slot:button-content>
      <img :src="user.pic" class="user-pic"/>
      {{ user.name }}
    </template>
    <template v-else v-slot:button-content>
      <b-icon-person class="user-icon"/>
      {{ user.name }}
    </template>
    <b-dropdown-item to="/auth">Auth</b-dropdown-item>
    <b-dropdown-item v-if="!user.isAuthenticated" to="/login">Login</b-dropdown-item>
    <b-dropdown-item v-else to="/logout">Logout</b-dropdown-item>
  </b-nav-item-dropdown>
</template>

<script>
import { mapGetters } from 'vuex'

export default {
  name: 'UserMenu',
  props: {
    user: {
      type: Object,
      default: () => {}
    }
  },
  data: function () {
    return {
    }
  },
  computed: {
    ...mapGetters('auth', [
      'getHeaders',
      'getHeadersLoaded',
      'isAuthenticated'
    ]),
    loaded: function () {
      console.log(this.getHeadersLoaded)
      return this.getHeadersLoaded === true
    },
    displayName () {
      return this.user.firstName + this.user.lastName
    },
    userStyle () {
      if (this.user.pic) {
        return 'user-menu user-menu-pic'
      } else {
        return 'user-menu user-menu-icon'
      }
    }
  },
  methods: {
    log () {
    }
  },
  mounted: function () {
    console.log('#### user menu mounted')
    console.log(this.user)
  }
}
</script>
<!-- Add "scoped" attribute to limit CSS to this component only -->
<style >
.user-pic {
  height: 2.5rem;
  width: 2.5rem;
  border-radius: 1rem
}
.user-icon {
  height: 2rem;
  width: 2rem;
}
li.user-menu > a.dropdown-toggle{
  color: #0033A1;
}
li.user-menu-icon>a.dropdown-toggle::after {
    display: inline-block;
    margin-left: 0.255em;
    vertical-align: 0.355rem;
    content: "";
    border-top: 0.5rem solid;
    border-right: 0.5rem solid transparent;
    border-bottom: 0;
    border-left: 0.5rem solid transparent;
}
li.user-menu-pic>a.dropdown-toggle::after {
    display: inline-block;
    margin-left: 0.255em;
    vertical-align: 0rem;
    content: "";
    border-top: 0.5rem solid;
    border-right: 0.5rem solid transparent;
    border-bottom: 0;
    border-left: 0.5rem solid transparent;
}
</style>
