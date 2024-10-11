<script setup>
import { ref } from "vue";
import { RouterLink, RouterView, useRouter } from 'vue-router'
import Menubar from 'primevue/menubar';


const router = useRouter();

const items = ref([
  {
    label: 'Home',
    icon: 'pi pi-fw pi-home',
    route: '/'
  },
  {
    label: 'EDT',
    icon: 'pi pi-fw pi-calendar',
    route: '/edt'
  },
  {
    label: 'Progression',
    icon: 'pi pi-fw pi-history',
    route: '/progression'
  },

  {
    label: 'Gestion',
    icon: 'pi pi-palette',
    items: [
      {
        label: 'Professeurs',
        route: '/gestion/professeurs'
      },
      {
        label: 'Matières',
        route: '/gestion/matieres'
      }
    ]
  },
]);

</script>

<template>
  <Menubar :model="items">
    <template #start>
      <svg width="35" height="40" viewBox="0 0 35 40" fill="none" xmlns="http://www.w3.org/2000/svg" class="h-8">
        <path d="..." fill="var(--p-primary-color)" />
        <path d="..." fill="var(--p-text-color)" />
      </svg>
    </template>
    <template #item="{ item, props, hasSubmenu }">
      <router-link v-if="item.route" v-slot="{ href, navigate }" :to="item.route" custom>
        <a v-ripple :href="href" v-bind="props.action" @click="navigate">
          <span :class="item.icon" />
          <span class="ml-2">{{ item.label }}</span>
        </a>
      </router-link>
      <a v-else v-ripple :href="item.url" :target="item.target" v-bind="props.action">
        <span :class="item.icon" />
        <span class="ml-2">{{ item.label }}</span>
        <span v-if="hasSubmenu" class="pi pi-fw pi-angle-down ml-2" />
      </a>
    </template>
    <template #end>
      <div class="flex items-center gap-2">
        <InputText placeholder="Search" type="text" class="w-32 sm:w-auto" />
        <Avatar image="/images/avatar/amyelsner.png" shape="circle" />
      </div>
    </template>
  </Menubar>
  <main>
  <RouterView />
  </main>
</template>

<style scoped>

</style>
