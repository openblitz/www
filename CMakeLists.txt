cmake_minimum_required(VERSION 3.10)
project(www)

add_custom_target(libwww ALL
  COMMAND ${CMAKE_COMMAND} -E echo "Building WebAssembly module..."
  COMMAND ${CMAKE_COMMAND} -E chdir ${CMAKE_SOURCE_DIR}/www wasm-pack build --dev --target web
  COMMAND ${CMAKE_COMMAND} -E echo "Copying wasm module to static directory..."
  COMMAND ${CMAKE_COMMAND} -E copy ${CMAKE_SOURCE_DIR}/www/pkg/www.js ${CMAKE_SOURCE_DIR}/src/lib/
  COMMAND ${CMAKE_COMMAND} -E copy ${CMAKE_SOURCE_DIR}/www/pkg/www.d.ts ${CMAKE_SOURCE_DIR}/src/lib/
  COMMAND ${CMAKE_COMMAND} -E copy ${CMAKE_SOURCE_DIR}/www/pkg/www_bg.wasm ${CMAKE_SOURCE_DIR}/static/
  COMMAND ${CMAKE_COMMAND} -E copy ${CMAKE_SOURCE_DIR}/www/pkg/www_bg.wasm.d.ts ${CMAKE_SOURCE_DIR}/src/lib/
)

add_custom_target(www ALL
  COMMAND ${CMAKE_COMMAND} -E echo "Running pnpm build..."
  COMMAND pnpm build
  WORKING_DIRECTORY ${CMAKE_SOURCE_DIR}
  DEPENDS libwww
)
