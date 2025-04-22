import { createUploaderComponent } from 'quasar'
import { computed } from 'vue'

// export a Vue component
export default createUploaderComponent({
    name: 'MyUploader',
    props: {},
    emits: [],
    injectPlugin ({ props, emit, helpers }) {
        const isUploading = computed(() => {

        })

        function abort () {

        }
        function upload () {

        }

        return {
            isUploading,
            isBusy,

            abort,
            upload
        }
    }
})