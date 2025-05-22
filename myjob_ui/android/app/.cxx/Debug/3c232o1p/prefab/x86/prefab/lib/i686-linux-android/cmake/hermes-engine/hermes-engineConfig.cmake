if(NOT TARGET hermes-engine::libhermes)
add_library(hermes-engine::libhermes SHARED IMPORTED)
set_target_properties(hermes-engine::libhermes PROPERTIES
    IMPORTED_LOCATION "C:/Users/ircpr/.gradle/caches/8.10.2/transforms/c5862d95bd64ba1e04741bed7439072b/transformed/jetified-hermes-android-0.76.3-debug/prefab/modules/libhermes/libs/android.x86/libhermes.so"
    INTERFACE_INCLUDE_DIRECTORIES "C:/Users/ircpr/.gradle/caches/8.10.2/transforms/c5862d95bd64ba1e04741bed7439072b/transformed/jetified-hermes-android-0.76.3-debug/prefab/modules/libhermes/include"
    INTERFACE_LINK_LIBRARIES ""
)
endif()

