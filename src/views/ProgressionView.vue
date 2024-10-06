<script setup></script>

<template>
  // un tableau de 18 colonnes et 20 lignes // 18 colonnes pour les 18 semaines de l'année
  universitaire // 20 lignes pour les 20 UE du semestre //dans chaque cellule on a une liste
  déroulante avec les CM, td et tp du module à répartir

  <table>
    <thead>
      <tr>
        <th></th>
        <th v-for="week in 18" :key="week">{{ week }}</th>
      </tr>
    </thead>
    <tbody>
      <tr v-for="ue in 20" :key="ue">
        <td>{{ ue }}</td>
        <td v-for="week in 18" :key="week">
          <select>
            <option>CM</option>
            <option>TD</option>
            <option>TP</option>
          </select>
        </td>
      </tr>
    </tbody>
  </table>
</template>

<style scoped></style>
