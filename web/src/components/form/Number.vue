<template>
    <p class="control">
        <label class="label">{{ data.label }}</label>
        <input class="input" type="number" :placeholder="data.placeholder" v-model="data.value" :disabled="data.disabled"
            :min="data.constraint.min" :max="data.constraint.max">
    </p>
</template>

<script>
export default {
    props: ['data']
}
</script>