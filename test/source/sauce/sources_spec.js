import { expect, assert } from 'chai';
import { Source } from '../../../source/sauce/sources'

describe('Source', () => {
	describe('an ajax source', ()=>{
		let source = new Source({
			object: {
				type: 'ajax',
				url: 'morphTargets.json',
				identify: ( context, item ) => {}
			}
		})
		let response = {
			children: [{
				name: 'test_child',
				matrix: [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0]
			}],
			objects: [{
				name: 'test_object',
				attributes: {
					test_attribute: {
	          type:"Uint16Array",
	          array: [0,1,2,3,4,5],
	          itemSize:1
					}
				}
			}],
			materials: [{
				name: 'test_material',
				uniforms: {
					test_uniform: { type: "f", value: 1.0 },
				}
			}]
		}
		describe("#connect", ()=>{ //formerly #link
			it('should query the source')
			it('should keep the queried data in a cache')
		})
		describe("#link", ()=>{ //formerly #connect
			it('should set the update action on the receiver')
			it('should correctly identify the data received')
			it('should call the setter for each sub-item')
			it('should add the given context to the redistribute cache')
		})
	})

})
