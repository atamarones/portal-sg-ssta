#!/bin/bash

# Colores para la salida
GREEN='\033[0;32m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}=== Iniciando pruebas unitarias ===${NC}"

# Verificar si se solicita cobertura
if [ "$1" == "--coverage" ]; then
  echo -e "${BLUE}Ejecutando pruebas con cobertura...${NC}"
  npm run test:coverage
else
  echo -e "${BLUE}Ejecutando pruebas...${NC}"
  npm test
fi

# Capturar el código de salida
TEST_RESULT=$?

# Mostrar resultado
if [ $TEST_RESULT -eq 0 ]; then
  echo -e "${GREEN}✓ Todas las pruebas pasaron correctamente${NC}"
else
  echo -e "${RED}✗ Algunas pruebas fallaron${NC}"
fi

exit $TEST_RESULT