# IUniswapV2Router01
**


## Table of contents:
- [Functions:](#functions)
  - [`factory() → address` (external) ](#iuniswapv2router01-factory--)
  - [`WETH() → address` (external) ](#iuniswapv2router01-weth--)
  - [`addLiquidity(address tokenA, address tokenB, uint256 amountADesired, uint256 amountBDesired, uint256 amountAMin, uint256 amountBMin, address to, uint256 deadline) → uint256 amountA, uint256 amountB, uint256 liquidity` (external) ](#iuniswapv2router01-addliquidity-address-address-uint256-uint256-uint256-uint256-address-uint256-)
  - [`addLiquidityETH(address token, uint256 amountTokenDesired, uint256 amountTokenMin, uint256 amountETHMin, address to, uint256 deadline) → uint256 amountToken, uint256 amountETH, uint256 liquidity` (external) ](#iuniswapv2router01-addliquidityeth-address-uint256-uint256-uint256-address-uint256-)
  - [`removeLiquidity(address tokenA, address tokenB, uint256 liquidity, uint256 amountAMin, uint256 amountBMin, address to, uint256 deadline) → uint256 amountA, uint256 amountB` (external) ](#iuniswapv2router01-removeliquidity-address-address-uint256-uint256-uint256-address-uint256-)
  - [`removeLiquidityETH(address token, uint256 liquidity, uint256 amountTokenMin, uint256 amountETHMin, address to, uint256 deadline) → uint256 amountToken, uint256 amountETH` (external) ](#iuniswapv2router01-removeliquidityeth-address-uint256-uint256-uint256-address-uint256-)
  - [`removeLiquidityWithPermit(address tokenA, address tokenB, uint256 liquidity, uint256 amountAMin, uint256 amountBMin, address to, uint256 deadline, bool approveMax, uint8 v, bytes32 r, bytes32 s) → uint256 amountA, uint256 amountB` (external) ](#iuniswapv2router01-removeliquiditywithpermit-address-address-uint256-uint256-uint256-address-uint256-bool-uint8-bytes32-bytes32-)
  - [`removeLiquidityETHWithPermit(address token, uint256 liquidity, uint256 amountTokenMin, uint256 amountETHMin, address to, uint256 deadline, bool approveMax, uint8 v, bytes32 r, bytes32 s) → uint256 amountToken, uint256 amountETH` (external) ](#iuniswapv2router01-removeliquidityethwithpermit-address-uint256-uint256-uint256-address-uint256-bool-uint8-bytes32-bytes32-)
  - [`swapExactTokensForTokens(uint256 amountIn, uint256 amountOutMin, address[] path, address to, uint256 deadline) → uint256[] amounts` (external) ](#iuniswapv2router01-swapexacttokensfortokens-uint256-uint256-address---address-uint256-)
  - [`swapTokensForExactTokens(uint256 amountOut, uint256 amountInMax, address[] path, address to, uint256 deadline) → uint256[] amounts` (external) ](#iuniswapv2router01-swaptokensforexacttokens-uint256-uint256-address---address-uint256-)
  - [`swapExactETHForTokens(uint256 amountOutMin, address[] path, address to, uint256 deadline) → uint256[] amounts` (external) ](#iuniswapv2router01-swapexactethfortokens-uint256-address---address-uint256-)
  - [`swapTokensForExactETH(uint256 amountOut, uint256 amountInMax, address[] path, address to, uint256 deadline) → uint256[] amounts` (external) ](#iuniswapv2router01-swaptokensforexacteth-uint256-uint256-address---address-uint256-)
  - [`swapExactTokensForETH(uint256 amountIn, uint256 amountOutMin, address[] path, address to, uint256 deadline) → uint256[] amounts` (external) ](#iuniswapv2router01-swapexacttokensforeth-uint256-uint256-address---address-uint256-)
  - [`swapETHForExactTokens(uint256 amountOut, address[] path, address to, uint256 deadline) → uint256[] amounts` (external) ](#iuniswapv2router01-swapethforexacttokens-uint256-address---address-uint256-)
  - [`quote(uint256 amountA, uint256 reserveA, uint256 reserveB) → uint256 amountB` (external) ](#iuniswapv2router01-quote-uint256-uint256-uint256-)
  - [`getAmountOut(uint256 amountIn, uint256 reserveIn, uint256 reserveOut) → uint256 amountOut` (external) ](#iuniswapv2router01-getamountout-uint256-uint256-uint256-)
  - [`getAmountIn(uint256 amountOut, uint256 reserveIn, uint256 reserveOut) → uint256 amountIn` (external) ](#iuniswapv2router01-getamountin-uint256-uint256-uint256-)
  - [`getAmountsOut(uint256 amountIn, address[] path) → uint256[] amounts` (external) ](#iuniswapv2router01-getamountsout-uint256-address---)
  - [`getAmountsIn(uint256 amountOut, address[] path) → uint256[] amounts` (external) ](#iuniswapv2router01-getamountsin-uint256-address---)


## Functions <a name="functions"></a>

### `factory() → address` (external) <a name="iuniswapv2router01-factory--"></a>


### `WETH() → address` (external) <a name="iuniswapv2router01-weth--"></a>


### `addLiquidity(address tokenA, address tokenB, uint256 amountADesired, uint256 amountBDesired, uint256 amountAMin, uint256 amountBMin, address to, uint256 deadline) → uint256 amountA, uint256 amountB, uint256 liquidity` (external) <a name="iuniswapv2router01-addliquidity-address-address-uint256-uint256-uint256-uint256-address-uint256-"></a>


### `addLiquidityETH(address token, uint256 amountTokenDesired, uint256 amountTokenMin, uint256 amountETHMin, address to, uint256 deadline) → uint256 amountToken, uint256 amountETH, uint256 liquidity` (external) <a name="iuniswapv2router01-addliquidityeth-address-uint256-uint256-uint256-address-uint256-"></a>


### `removeLiquidity(address tokenA, address tokenB, uint256 liquidity, uint256 amountAMin, uint256 amountBMin, address to, uint256 deadline) → uint256 amountA, uint256 amountB` (external) <a name="iuniswapv2router01-removeliquidity-address-address-uint256-uint256-uint256-address-uint256-"></a>


### `removeLiquidityETH(address token, uint256 liquidity, uint256 amountTokenMin, uint256 amountETHMin, address to, uint256 deadline) → uint256 amountToken, uint256 amountETH` (external) <a name="iuniswapv2router01-removeliquidityeth-address-uint256-uint256-uint256-address-uint256-"></a>


### `removeLiquidityWithPermit(address tokenA, address tokenB, uint256 liquidity, uint256 amountAMin, uint256 amountBMin, address to, uint256 deadline, bool approveMax, uint8 v, bytes32 r, bytes32 s) → uint256 amountA, uint256 amountB` (external) <a name="iuniswapv2router01-removeliquiditywithpermit-address-address-uint256-uint256-uint256-address-uint256-bool-uint8-bytes32-bytes32-"></a>


### `removeLiquidityETHWithPermit(address token, uint256 liquidity, uint256 amountTokenMin, uint256 amountETHMin, address to, uint256 deadline, bool approveMax, uint8 v, bytes32 r, bytes32 s) → uint256 amountToken, uint256 amountETH` (external) <a name="iuniswapv2router01-removeliquidityethwithpermit-address-uint256-uint256-uint256-address-uint256-bool-uint8-bytes32-bytes32-"></a>


### `swapExactTokensForTokens(uint256 amountIn, uint256 amountOutMin, address[] path, address to, uint256 deadline) → uint256[] amounts` (external) <a name="iuniswapv2router01-swapexacttokensfortokens-uint256-uint256-address---address-uint256-"></a>


### `swapTokensForExactTokens(uint256 amountOut, uint256 amountInMax, address[] path, address to, uint256 deadline) → uint256[] amounts` (external) <a name="iuniswapv2router01-swaptokensforexacttokens-uint256-uint256-address---address-uint256-"></a>


### `swapExactETHForTokens(uint256 amountOutMin, address[] path, address to, uint256 deadline) → uint256[] amounts` (external) <a name="iuniswapv2router01-swapexactethfortokens-uint256-address---address-uint256-"></a>


### `swapTokensForExactETH(uint256 amountOut, uint256 amountInMax, address[] path, address to, uint256 deadline) → uint256[] amounts` (external) <a name="iuniswapv2router01-swaptokensforexacteth-uint256-uint256-address---address-uint256-"></a>


### `swapExactTokensForETH(uint256 amountIn, uint256 amountOutMin, address[] path, address to, uint256 deadline) → uint256[] amounts` (external) <a name="iuniswapv2router01-swapexacttokensforeth-uint256-uint256-address---address-uint256-"></a>


### `swapETHForExactTokens(uint256 amountOut, address[] path, address to, uint256 deadline) → uint256[] amounts` (external) <a name="iuniswapv2router01-swapethforexacttokens-uint256-address---address-uint256-"></a>


### `quote(uint256 amountA, uint256 reserveA, uint256 reserveB) → uint256 amountB` (external) <a name="iuniswapv2router01-quote-uint256-uint256-uint256-"></a>


### `getAmountOut(uint256 amountIn, uint256 reserveIn, uint256 reserveOut) → uint256 amountOut` (external) <a name="iuniswapv2router01-getamountout-uint256-uint256-uint256-"></a>


### `getAmountIn(uint256 amountOut, uint256 reserveIn, uint256 reserveOut) → uint256 amountIn` (external) <a name="iuniswapv2router01-getamountin-uint256-uint256-uint256-"></a>


### `getAmountsOut(uint256 amountIn, address[] path) → uint256[] amounts` (external) <a name="iuniswapv2router01-getamountsout-uint256-address---"></a>


### `getAmountsIn(uint256 amountOut, address[] path) → uint256[] amounts` (external) <a name="iuniswapv2router01-getamountsin-uint256-address---"></a>

