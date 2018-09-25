import * as chai from 'chai';
import { ParseClient, RxParseObject, RxParseQuery } from 'RxParse';

// describe('RxAVQuery', () => {
//     before(() => {
//         RxAVClient.init({
//             appId: '6j2LjkhAnnDTeefTLFQTFJXx-gzGzoHsz',
//             appKey: 'mrChsHGwIAytLHopODLpqiHo',
//             region: 'cn',
//             log: true,
//             pluginVersion: 2
//         });
//     });
//     it('RxAVQuery#include', done => {
//         let query = new RxAVQuery('Baby_User');
//         query.include('baby');

//         query.find().subscribe(serverBabies => {
//             serverBabies.map(sBaby => {
//                 let baby: RxAVObject = sBaby.get('baby');
//                 console.log('baby', baby);
//                 console.log('baby.name', baby.get('name'));
//             });
//             done();
//         });
//     });
// });