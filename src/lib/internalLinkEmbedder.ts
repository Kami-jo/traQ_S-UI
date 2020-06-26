/**
 * https://github.com/traPtitech/traQ/blob/master/utils/message/replacer.goと同様
 */

const mentionRegex = /[@＠]([\S]{1,32})/g
const userStartsRegex = /^[@＠]([a-zA-Z0-9_-]{1,32})^(?!.*:)/g
const channelRegex = /[#＃]([a-zA-Z0-9_/-]+)/g

const backQuote = '`'
const dollar = '$'
const defaultCodeTokenLength = 3

export type ReplaceGetters = UserAndGroupGetters & ChannelGetter

interface UserAndGroupGetters {
  /**
   * nameは大文字小文字を無視する
   */
  getUser: (userName: string) => Entity | undefined
  /**
   * nameは大文字小文字を無視する
   */
  getGroup: (groupName: string) => Entity | undefined
}
interface ChannelGetter {
  /**
   * nameは大文字小文字を無視する
   */
  getChannel: (channelPath: string) => Entity | undefined
}

export interface Entity {
  id: string
}

/**
 * コードブロックとLaTeXブロック内でない箇所の内部リンク埋め込みを行う
 * replacer.goのReplaceと同様のコード
 */
export const replace = (m: string, getters: ReplaceGetters) => {
  let inCodeBlock = false
  let inLatexBlock = false
  let codeTokenLength = defaultCodeTokenLength

  const lines = m.split('\n')
  const newLines = lines.map(line => {
    if (!inLatexBlock && line.startsWith('`'.repeat(codeTokenLength))) {
      // `の数が一致するものと組み合うようにする
      if (!inCodeBlock) {
        codeTokenLength = countPrefix(line, backQuote)
      } else {
        codeTokenLength = defaultCodeTokenLength
      }

      inCodeBlock = !inCodeBlock
    }
    if (!inCodeBlock && line.startsWith('$$')) {
      inLatexBlock = !inLatexBlock
    }
    if (inCodeBlock || inLatexBlock) {
      return line
    }
    // 「```」のブロックでも「$$」ブロック内でもないときに置換

    let newLine = ''
    // 「`」「$」で囲まれていないところの始めの文字のindex
    let noExpressionStartIndex = 0
    const chs = [...line]
    for (let i = 0; i < chs.length; i++) {
      const ch = chs[i]
      if (ch !== backQuote && ch !== dollar) {
        continue
      }

      // 囲まれていない場所が終了したのでその箇所は置換する
      newLine += replaceAll(
        chs.slice(noExpressionStartIndex, i).join(''),
        getters
      )

      if (ch === dollar) {
        // 「`」は「$」よりも優先されるので
        // 「$ ` $」のように「`」がペアの「$」より前にあるときは
        // 「$」のペアとして処理しない
        const backQuoteI = chs.indexOf(backQuote, i + 1)
        const dollarI = chs.indexOf(dollar, i + 1)
        if (backQuoteI !== -1 && dollarI !== -1 && backQuoteI < dollarI) {
          newLine += ch
          noExpressionStartIndex = i + 1
          continue
        }
      }
      const newI = chs.indexOf(ch, i + 1)
      if (newI === -1) {
        // 「$」/「`」のペアがないとき
        newLine += ch
        noExpressionStartIndex = i + 1
        continue
      }
      newLine += chs.slice(i, newI).join('')
      i = newI
      noExpressionStartIndex = newI
    }
    // 最後のペア以降の置換
    newLine += replaceAll(chs.slice(noExpressionStartIndex).join(''), getters)
    return newLine
  })
  return newLines.join('\n')
}

const replaceAll = (m: string, getters: ReplaceGetters) => {
  return replaceMention(replaceChannel(m, getters), getters)
}

const replaceMention = (m: string, getters: UserAndGroupGetters) => {
  return m.replace(mentionRegex, s => {
    // .slice(1)は先頭の@を消すため
    // 小文字化はgetter内で行う
    const name = s.slice(1)
    const uid = getters.getUser(name)?.id
    if (uid) {
      return `!{"type":"user","raw":"${s}","id":"${uid}"}`
    }
    const gid = getters.getGroup(name)?.id
    if (gid) {
      return `!{"type":"group","raw":"${s}","id":"${gid}"}`
    }
    return s.replace(userStartsRegex, s => {
      // .slice(1)は先頭の@を消すため
      // 小文字化はgetter内で行う
      const name = s.slice(1)

      const uid = getters.getUser(name)?.id
      if (uid) {
        return `!{"type":"user","raw":"${s}","id":"${uid}"}`
      }
      return s
    })
  })
}

const replaceChannel = (m: string, getter: ChannelGetter) => {
  return m.replace(channelRegex, s => {
    // .slice(1)は先頭の#を消すため
    // 小文字化はgetter内で行う
    const t = s.slice(1)
    const cid = getter.getChannel(t)?.id
    if (cid) {
      return `!{"type":"channel","raw":"${s}","id":"${cid}"}`
    }
    return s
  })
}

const countPrefix = (line: string, letter: string) => {
  let count = 0
  for (const ch of line) {
    if (ch !== letter) break
    count++
  }
  return count
}
