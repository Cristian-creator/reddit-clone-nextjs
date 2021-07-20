import { Box, Button, Link, makeStyles, Typography } from "@material-ui/core"
import NextLink from 'next/link'
import { useLogoutMutation, useMeQuery } from "../generated/graphql";
import { isServer } from "../utils/isServer";
import { useRouter } from 'next/router';

interface NavBarProps {

}

const classes = makeStyles({
    linkBtn: {
        color: "white"
    }
});

export const NavBar: React.FC<NavBarProps> = ({}) => {
    const router = useRouter();
    const [ , logout]  = useLogoutMutation();
    const [{ data, fetching }]  = useMeQuery({
        pause: isServer()     // dont run query on server
    });

    let body = null;

    // data is loading
    if(fetching) {
        body = null;
        // user not logged in
    } else if(!data?.me) {
        body = (
            <>
                <NextLink href="/login">
                    <Button color="secondary" >
                        <Link
                            variant="body2"
                            color="textSecondary"
                        >
                            Login
                        </Link>
                    </Button>
                 </NextLink>
                 <NextLink href="/register">
                    <Button >
                        <Link
                            variant="body2"
                            color="textSecondary"
                        >
                            Register
                        </Link>
                    </Button>
                 </NextLink>
            </>
        );
        // user is logged in
    } else {
        body = (
            <Box display="flex" alignItems="center" >
                <NextLink href="/create-post">
                    <Link component="button" variant="body2" color="textPrimary" >
                        create post
                    </Link>
                </NextLink>
                <Box ml={3} mr={3} > {data.me.username} </Box>
                <Button onClick={async () => {
                    await logout();
                    router.reload();
                }} variant="contained" color="secondary" >logout</Button>
            </Box>
        )
    }
    return (
        <Box zIndex={1} position="sticky" top={0} display="flex" alignItems="center" justifyContent="center" bgcolor="secondary.light" p={4} ml={'auto'}>
           <Box width="100%" maxWidth="800px" display="flex" alignItems="center" justifyContent="space-between" >
                <NextLink href="/" >
                    <Link component="button" >
                        <Typography color="textPrimary" variant="h4"> LiReddit </Typography>
                    </Link>
                </NextLink>
                <Box>
                    { body }    
                </Box>    
           </Box>
        </Box>
    );
}