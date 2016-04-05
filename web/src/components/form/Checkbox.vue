<template>
    <p class="control">
        <label class="checkbox">
            <input type="checkbox" :placeholder="data.placeholder" v-model="data.value" :disabled="data.disabled">
            {{ data.label }}
        </label>
    </p>
</template>

<script>
export default {
    props: ['data']
}
</script>