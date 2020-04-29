import request from '@/plugin/axios'

export function getMap (name) {
  return request({
    url: '/json/' + name,
    method: 'get'
  })
}
