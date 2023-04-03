// middleware.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
const { pathToRegexp, match, parse, compile } = require("path-to-regexp");

const patternFn = (regexp: string, pathname: string) => {
  const fn = match(regexp, { decode: decodeURIComponent });
  let pattern = fn(pathname);
  return pattern;
};

const listRegexp = "/list/:id?{/page-:current}?";
const articleRegexp = "/article/:id?{/page-:current}?";
const searchRegexp = "/search/:id?{/page-:current}?";
const tagRegexp = "/tag/:id?{/page-:current}?";
const pageRegexp = "/page/:id";

function allMatch(pathname: string) {
  const regexpArr = [listRegexp,articleRegexp,searchRegexp,pageRegexp,tagRegexp]
  const pageType = ["list","article","search","page","tag"]
  for (let index = 0; index < regexpArr.length; index++) {
    const regexp = regexpArr[index];
    let pattern = patternFn(regexp, pathname)
    if(pattern) {
      return {
        type : pageType[index],
        pattern
      }
    }
  }
  return false
}

// This function can be marked `async` if using `await` inside
export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  /* 路由约定
   ** / => 首页
   ** /list/:id => 列表页
   ** /article/:id => 详情页
   ** /search/:keywords => 搜索列表
   ** /page/:id => 单页
   ** tag/:id => 标签
   */

  if (pathname !== "/") {
    const location = allMatch(pathname);
    if(location) {
      req.nextUrl.pathname = "/";
      req.nextUrl.searchParams.set("location",JSON.stringify(location))
    }else {
      req.nextUrl.pathname = "404";
    }
  }

  return NextResponse.rewrite(req.nextUrl);
}

export const config = {
  matcher: [
    "/((?!api|assets|api|static|_next|favicon.ico).*)" // match all paths not starting with 'public' or 'static'
  ]
};
