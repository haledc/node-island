/*
 * @Author: Hale
 * @Description: 自定义校验器
 * @Date: 2019-05-18
 * @LastEditTime: 2019/06/20
 */
const { LinValidator, Rule } = require('../../core/lin-validator-v2')
const { User } = require('../models/user')
const { LoginType, ArtType } = require('../lib/enum')

class PositiveIntegerValidator extends LinValidator {
  constructor() {
    super()
    this.id = [new Rule('isInt', '需要正整数', { min: 1 })]
  }
}

class RegisterValidator extends LinValidator {
  constructor() {
    super()
    this.email = [new Rule('isEmail', '不符合Email规范')]
    this.password1 = [
      new Rule('isLength', '密码至少6个字符，最多32个字符', {
        min: 6,
        max: 32
      }),
      new Rule(
        'matches',
        '密码不符合规范',
        '^(?![0-9]+$)(?![a-zA-Z]+$)[0-9A-Za-z]'
      )
    ]
    this.password2 = this.password1
    this.nickname = [
      new Rule('isLength', '昵称不符合长度规范', { min: 4, max: 32 })
    ]
  }

  validatePassword(values) {
    const password1 = values.body.password1
    const password2 = values.body.password2
    if (password1 !== password2) {
      throw new Error('两次输入的密码必须相同')
    }
  }

  async validateEmail(values) {
    const email = values.body.email
    const user = await User.findOne({
      where: {
        email
      }
    })
    if (user) {
      throw new Error('email已存在')
    }
  }
}

class TokenValidator extends LinValidator {
  constructor() {
    super()
    this.account = [new Rule('isLength', '不符合账号规范', { min: 4, max: 32 })]
    this.secret = [
      new Rule('isOptional'), // 账号必需，密码可以不用
      new Rule('isLength', '至少6个字符', { min: 6, max: 128 })
    ]
  }

  validateLoginType(values) {
    const type = values.body.type

    if (!type) {
      throw new Error('type是必须参数')
    }
    if (!LoginType.isThisType(type)) {
      throw new Error('type参数不合法')
    }
  }
}

class NotEmptyValidator extends LinValidator {
  constructor() {
    super()
    this.token = [new Rule('isLength', '不允许为空', { min: 1 })]
  }
}

function checkLoginType(values) {
  let type = values.body.type || values.path.type
  if (!type) {
    throw new Error('type是必须参数')
  }

  type = parseInt(type)
  if (!LoginType.isThisType(type)) {
    throw new Error('type参数不合法')
  }
}

function checkArtType(values) {
  let type = values.body.type || values.path.type
  if (!type) {
    throw new Error('type是必须参数')
  }

  type = parseInt(type)
  if (!ArtType.isThisType(type)) {
    throw new Error('type参数不合法')
  }
}

class LikeValidator extends PositiveIntegerValidator {
  constructor() {
    super()
    this.validateType = checkArtType
  }
}

class ClassicValidator extends LikeValidator {}

class SearchValidator extends LinValidator {
  constructor() {
    super()
    this.keyword = [
      new Rule('isLength', '搜索关键词不能为空', { min: 1, max: 16 })
    ]
    this.start = [
      new Rule('isInt', '不符合规范', { min: 0, max: 60000 }),
      new Rule('isOptional', '', 0)
    ]
    this.count = [
      new Rule('isInt', '不符合规范', { min: 1, max: 20 }),
      new Rule('isOptional', '', 20)
    ]
  }
}

class AddShortCommentValidator extends PositiveIntegerValidator {
  constructor() {
    super()
    this.content = [
      new Rule('isLength', '必须在1到12个字符之间', { min: 1, max: 12 })
    ]
  }
}

module.exports = {
  PositiveIntegerValidator,
  RegisterValidator,
  TokenValidator,
  NotEmptyValidator,
  LikeValidator,
  ClassicValidator,
  SearchValidator,
  AddShortCommentValidator
}
