Update SEMVER PATCH (using src/utils/version.ts to perform SEMVER updates)

./server.sh stop
npm run build
pass all tests
./server.sh start
pass all E2E tests
and push to remote
