<template>
    <p class="control">
        <label class="label">{{ data.label }}</label>
        <input class="input" type="text" :placeholder="data.placeholder" v-model="data.value" :disabled="data.disabled"
            :minlength="data.constraint.minLength" :maxlength="data.constraint.maxLength">
    </p>
</template>

<script>
export default {
    props: ['data']
}
</script>