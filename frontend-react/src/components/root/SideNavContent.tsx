import React, { useContext } from "react"
import {
  IconButton,
  useColorMode,
  Flex,
  List,
  ListIcon,
  PseudoBox,
  ListItem,
  Menu,
  MenuButton,
  MenuItem,
  MenuList,
  Box,
} from "@chakra-ui/core"
import { Link } from "@reach/router"
import {
  FiSun,
  FiMoon,
  FiMap,
  FiCalendar,
  FiUsers,
  FiAward,
  FiFolderPlus,
  FiSearch,
  FiBarChart2,
  FiLogOut,
  FiUser,
  FiPlus,
  FiLogIn,
  FiHeart,
} from "react-icons/fi"
import { RiTShirt2Line, RiTShirtAirLine } from "react-icons/ri"
import Logo from "./Logo"
import NavItem from "./NavItem"
import { useQuery } from "@apollo/react-hooks"
import { USER } from "../../graphql/queries/user"
import UserAvatar from "../common/UserAvatar"
import DividingBox from "../common/DividingBox"
import { UserData } from "../../types"
import ColorPicker from "./ColorPicker"
import Error from "../common/Error"
import MyThemeContext from "../../themeContext"

const UserItem: React.FC<{ data?: UserData }> = ({ data }) => {
  const { themeColorWithShade, bgColor } = useContext(MyThemeContext)
  if (!data || !data.user) {
    return (
      <List>
        <ListItem>
          <a href="/auth/discord">
            <PseudoBox
              mx={-2}
              display="flex"
              cursor="pointer"
              px="2"
              py="1"
              transition="all 0.2s"
              fontWeight="medium"
              outline="none"
              _focus={{ shadow: "outline" }}
              _hover={{
                transform: "translateX(2px)",
              }}
            >
              <ListIcon
                icon={FiLogIn}
                color={themeColorWithShade}
                size="1.5em"
              />{" "}
              Log in via Discord
            </PseudoBox>
          </a>
        </ListItem>
      </List>
    )
  }

  return (
    <Menu>
      <MenuButton>
        <UserAvatar name={data.user.username} src={data.user.avatar} />
      </MenuButton>
      <MenuList bg={bgColor}>
        <Link
          to={
            data.user.custom_url
              ? `u/${data.user.custom_url}`
              : `u/${data.user.discord_id}`
          }
        >
          <MenuItem>
            <Flex alignItems="center" justifyContent="center">
              <Box as={FiUser} w="24px" h="auto" mr="1em" />{" "}
              <Box as="span" mt="2px">
                Profile
              </Box>
            </Flex>
          </MenuItem>
        </Link>
        <a href="/logout">
          <MenuItem>
            <Flex alignItems="center" justifyContent="center">
              <Box as={FiLogOut} w="24px" h="auto" mr="1em" />{" "}
              <Box as="span" mt="2px">
                Log out
              </Box>
            </Flex>
          </MenuItem>
        </a>
      </MenuList>
    </Menu>
  )
}

interface SideNavProps {
  showLogo?: boolean
}

export const SideNavContent: React.FC<SideNavProps> = ({ showLogo = true }) => {
  const { colorMode, toggleColorMode } = useColorMode()
  const { data, error, loading } = useQuery<UserData>(USER)

  if (error) return <Error errorMessage={error.message} />

  return (
    <Flex
      direction="column"
      h="100%"
      py={8}
      justifyContent="space-between"
      alignItems="center"
    >
      <Flex direction="column">
        {showLogo && (
          <Flex alignSelf="center">
            <Link to="/">
              <Logo />
            </Link>
          </Flex>
        )}
        <Flex>
          <List mt="2em">
            <NavItem to="plans" icon={FiMap} title="Map Planner" />
            <NavItem to="calendar" icon={FiCalendar} title="Calendar" />
            <NavItem to="builds" icon={RiTShirt2Line} title="Builds" />
            <NavItem
              to="analyzer"
              icon={RiTShirtAirLine}
              title="Build Analyzer"
            />
            <NavItem to="u" icon={FiUsers} title="User Search" />
            <NavItem to="freeagents" icon={FiHeart} title="Free Agents" />
            <NavItem
              to="tournaments"
              icon={FiAward}
              title="Tournament Results"
            />
            <NavItem to="draft" icon={FiFolderPlus} title="Draft Cup" />
            <NavItem to="xsearch" icon={FiSearch} title="Top 500 Browser" />
            <NavItem
              to="xtrends"
              icon={FiBarChart2}
              title="Top 500 Tier Lists"
            />
            {data?.user?.plus?.membership_status && (
              <NavItem to="plus" icon={FiPlus} title="Plus Server" />
            )}
          </List>
        </Flex>
      </Flex>
      <Flex align="flex-end" direction="column" alignItems="center">
        <DividingBox location="bottom" margin="0.7em">
          <Flex
            alignSelf="center"
            alignItems="center"
            justifyContent="center"
            flexBasis="100%"
          >
            <IconButton
              aria-label={`Switch to ${
                colorMode === "light" ? "dark" : "light"
              } mode`}
              variant="ghost"
              color="current"
              fontSize="20px"
              onClick={toggleColorMode}
              icon={colorMode === "light" ? FiSun : FiMoon}
            />
            <ColorPicker />
          </Flex>
        </DividingBox>
        {!loading && !error && <UserItem data={data} />}
      </Flex>
    </Flex>
  )
}
