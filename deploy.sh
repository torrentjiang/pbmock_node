cd /opt/app
rm -rf ./fe-inner-node
mkdir -p fe-inner-node
cd fe-inner-node
mv ../dist.tar.gz .
tar -zxvf dist.tar.gz
rm -rf dist.tar.gz
chmod -R 755 ../fe-inner-node
npm run stop
npm run tsc
npm start