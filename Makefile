dao:
	solcjs --optimize --abi ./contracts/CreatorDAO.sol -o build  --include-path 'node_modules/' --base-path '/' -v
	solcjs --optimize --bin ./contracts/CreatorDAO.sol -o build  --include-path 'node_modules/' --base-path '/' -v
	abigen --abi=./build/home_subash_workspace_crastonic_creabo-contracts_contracts_CreatorDAO_sol_CreatorDAO.abi --bin=./build/home_subash_workspace_crastonic_creabo-contracts_contracts_CreatorDAO_sol_CreatorDAO.bin --pkg=dao --out=./generated/CreatorDAO.go

collection:
	solcjs --optimize --abi ./contracts/ERC721Collection.sol -o build  --include-path 'node_modules/' --base-path '/' -v
	solcjs --optimize --bin ./contracts/ERC721Collection.sol -o build  --include-path 'node_modules/' --base-path '/' -v
	abigen --abi=./build/home_subash_workspace_crastonic_creabo-contracts_contracts_ERC721Collection_sol_ERC721NFTCustom.abi --bin=./build/home_subash_workspace_crastonic_creabo-contracts_contracts_ERC721Collection_sol_ERC721NFTCustom.bin --pkg=collection --out=./generated/ERC721Collection.go