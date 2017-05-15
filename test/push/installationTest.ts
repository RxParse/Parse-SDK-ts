import * as chai from 'chai';
import { RxAVClient, RxAVObject, RxAVUser, RxAVACL, RxAVRole, RxAVQuery, RxAVInstallation } from '../../src/RxLeanCloud';

// describe('RxAVInstallation', function () {
//     before(() => {
//         RxAVClient.init({
//             appId: '6j2LjkhAnnDTeefTLFQTFJXx-gzGzoHsz',
//             appKey: 'mrChsHGwIAytLHopODLpqiHo',
//             region: 'cn',
//             log: true,
//             pluginVersion: 2
//         });
//     });
//     it('RxAVInstallation#save', done => {
//         let installation = new RxAVInstallation();
//         installation.deviceType = 'ios';
//         installation.deviceToken = '0dd8d2697841d7292dc6cce7ba8172ba77ae62f454ecf5974830e0469431efe9';
//         installation.channels = ['public', 'fuck'];
//         installation.save().subscribe(s => {
//             done();
//         });
//     });
// });